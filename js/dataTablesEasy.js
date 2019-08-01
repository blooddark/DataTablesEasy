// 轻松实现dataTables常用功能
// 占用全局变量：dataTableEasy
// 依赖JQuery

let dataTableEasy;
function createDataTable(id, listUrl, columns, selectList, editUrl, deleteUrl, addUrl, buttonList) {
    let table = $(`#${id}`);

    // 创建表格头部
    let thead = [];
    thead.push(`<thead><tr>`);
    // 添加顶部搜索框
    for (let i = 0; i < columns.length; i++) {
        thead.push(`<th><input columns="${i}" class="form-control input-sm" type="text" placeholder="筛选 ${columns[i].data}"></th>`);
    }
    thead.push(`</tr>`);
    // 添加表格表头
    for (let i = 0; i < columns.length; i++) {
        thead.push(`<th>${columns[i].data}</th>`);
    }
    thead.push(`</tr></thead>`);
    table.html(thead.join(''));

    // 定义表格按钮
    const addButton = {
        text: 'Add',
            action: ( e, dt, node, config ) => {
        let modal = [`<div id="addModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"><div class="modal-dialog" role="document"><div class="modal-content">`];
        modal.push(`<div class="ibox-content"><form onsubmit="return handleAddSubmit();" method="get" class="form-horizontal">`);
        $.each(dataTableEasy.columnsRecord, (index, item) => {
            modal.push(`<div style="display: block;margin-top: 10px;" class="form-group"><label class="col-sm-2 control-label">${item.data}</label>
                                    <div class="col-sm-10"><input name="${item.data}" type="text" class="form-control"></div>
                                </div>`);
        });
        modal.push(`<div style="margin-top: 20px;" class="form-group">
                                <div class="col-sm-4 col-sm-offset-8">
                                    <button class="btn btn-primary" type="submit">Save changes</button>
                                </div>
                            </div>`);
        modal.push(`</form></div></div></div></div>`);
        table.append(modal.join(''));
        $('#addModal').modal().on('hide.bs.modal', (e) => {
            dt.ajax.reload();
        });
    }
    };
    const deleteButton = {
        text: 'Delete',
            action: ( e, dt, node, config ) => {
        let deleteIds = [];
        $.each(dt.rows({selected: true}).data(), (index, item) => {
            deleteIds.push(item.id);
        });
        if (deleteIds.length < 1) {
            toastr.error('请先选择要删除的行');
            return;
        }
        $.ajax({
            url: dataTableEasy.deleteUrl,
            method: 'delete',
            data: {id: deleteIds},
            success: (res) => {
                toastr.success('删除成功');
                dt.ajax.reload();
            },
            error: (res) => {
                toastr.error('网络异常，或服务器出现故障');
            }
        });
    }
    };
    const copyButton = {extend: 'copy'};
    const csvButton = {extend: 'csv', title: 'ExportFile'};
    const excelButton = {extend: 'excel', title: 'ExportFile'};
    const pdfButton = {extend: 'pdf', title: 'ExportFile'};
    const printButton = {extend: 'print',
        customize: function (win){
        $(win.document.body).addClass('white-bg');
        $(win.document.body).css('font-size', '10px');

        $(win.document.body).find('table')
            .addClass('compact')
            .css('font-size', 'inherit');
    }
    };
    let buttons = [];
    $.each(buttonList, (index, item) => {
        switch (item) {
            case 'add': buttons.push(addButton); break;
            case 'delete': buttons.push(deleteButton); break;
            case 'copy': buttons.push(copyButton); break;
            case 'csv': buttons.push(csvButton); break;
            case 'excel': buttons.push(excelButton); break;
            case 'pdf': buttons.push(pdfButton); break;
            case 'print': buttons.push(printButton); break;
        }
    });

    // 创建表格
    dataTableEasy = table.DataTable({
        "serverSide": true,
        processing: true,
        ajax: {
            url: listUrl,
            type: 'get',
            dataSrc: 'data'
        },
        columns: columns,
        "deferRender": true,
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return data +' ('+ row['remark']+')';
                },
                "targets": 0
            }
        ],
        select: true,
        responsive: true,
        dom: '<"html5buttons"B>lTfgitp',
        buttons: buttons
    });
    dataTableEasy.editUrl = editUrl;
    dataTableEasy.deleteUrl = deleteUrl;
    dataTableEasy.addUrl = addUrl;
    dataTableEasy.columnsRecord = columns;

    // 添加搜索框事件
    dataTableEasy.columns().every( function () {
        var that = this;
        $(`input[columns=${that[0][0]}]`).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that.search(this.value)
                    .draw();
            }
        } );
    } );

    // 绑定表格事件
    dataTableEasy.on( 'order.dt',  (e, settings, json) => { console.log( 'Order' ); } )
        .on( 'search.dt', (e, settings, json) => { console.log( 'Search' ); } )
        .on( 'page.dt',   (e, settings, json) => { console.log( 'Page' ); } );

    // 双击单元格开启编辑功能
    $(`#${id} tbody`).on('dblclick', 'td', (e) => {
        let cell = dataTableEasy.cell(e.currentTarget);
        // 判断是否开启编辑功能
        if (dataTableEasy.columnsRecord[cell[0][0].column].editable === false) {
            return;
        }
        // 判断是否已在编辑中
        if (cell.data().toString().indexOf('<input') !== -1 || cell.data().toString().indexOf('<select>') !== -1) {
            return;
        }
        // 将静态文本变为可输入表单
        // 判断是否是select
        let isSelect = false;
        $.each(selectList, (index, item) => {
            if (cell[0][0].column === item.columnNumber) {
                let select = [`<select columns="${cell[0][0].column}" class="form-control input-sm" id="tempSelect" onblur="editOnblur(this);" onchange="editOnblur(this);">`];
                $.each(item.values, (index, item) => {
                    let selected = '';
                    if (cell.data() === item.name) {
                        selected = 'selected';
                    }
                    select.push(`<option ${selected} value="${item.name}">${item.name}</option>`)
                });
                select.push(`</select>`);
                cell.data(select.join(''));
                $('#tempSelect').focus();
                isSelect = true;
            }
        });
        if (isSelect) {
            return;
        }
        // 否则是input text
        let val = cell.data(); // 记录之前的值，方便将光标定位到后面
        cell.data(`<input columns="${cell[0][0].column}" class="form-control input-sm" id="tempInput" type="text" value="${cell.data()}" onblur="editOnblur(this);"/>`);
        $('#tempInput').val("").focus().val(val); // 将光标定位到后面
    });
    return dataTableEasy;
}

// 单元格编辑
function editOnblur(dom) {
    let data = {id: dataTableEasy.cell($(dom).parent().parent().children(0)[0]).data()};
    data[dataTableEasy.columnsRecord[$(dom).attr('columns')].data] = $(dom).val();
    $.ajax({
        url: dataTableEasy.editUrl,
        method: 'put',
        data: data,
        success: (res) => {
            toastr.success('修改成功');
        },
        error: (res) => {
            toastr.error('网络异常，或服务器出现故障')
        },
        complete: () => {
            try {
                dataTableEasy.cell($(dom).parent()[0]).data($(dom).val());
            }catch(e){
            }
        }
    });
}

// 添加数据
function handleAddSubmit() {
    let data = {};
    $.each(dataTableEasy.columnsRecord, (index, item) => {
        data[item.data] = $(`input[name=${item.data}]`).val();
    });
    $.ajax({
        url: dataTableEasy.editUrl,
        method: 'post',
        data: data,
        success: (res) => {
            toastr.success('添加成功');
            dataTableEasy.ajax.reload();
            $('#addModal').modal('hide');
        },
        error: (res) => {
            toastr.error('网络异常，或服务器出现故障')
        }
    });
    return false;
}
