// 轻松实现dataTables常用功能
// 占用全局变量：dataTableEasy
// 依赖JQuery、BootStrap

let dataTableEasy;
// 创建数据表格
function createDataTable(id, listUrl, columns, addUrl, editUrl, deleteUrl, buttonList) {
    let table = $(`#${id}`);

    // 创建表格头部
    createTableHeader(table, columns);

    // 定义表格按钮
    let buttonSet = new Set(['add', 'delete'].concat(buttonList));
    if (!addUrl) {
        buttonSet.delete('add');
    }
    if (!deleteUrl) {
        buttonSet.delete('delete');
    }
    let buttons = createTableButton(table, buttonSet);

    // 创建列重写对象
    let columnDefs = [];
    $.each(columns, (index, item) => {
        if (item.render) {
            columnDefs.push({
                render: item.render,
                targets: index
            })
        }
    });

    // 创建表格
    dataTableEasy = table.DataTable({
        serverSide: true,
        processing: true,
        ajax: {
            url: listUrl,
            type: 'get',
            dataSrc: 'data'
        },
        columns: columns,
        deferRender: true,
        columnDefs: columnDefs,
        select: true,
        responsive: true,
        dom: '<"html5buttons"B>lTfgitp',
        buttons: buttons
    });

    // 绑定表格信息
    dataTableEasy.addUrl = addUrl;
    dataTableEasy.editUrl = editUrl;
    dataTableEasy.deleteUrl = deleteUrl;
    dataTableEasy.columnsRecord = columns;

    // 添加搜索框事件
    dataTableEasy.columns().every( function () {
        let that = this;
        $(`input[columns=${this[0][0]}]`).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that.search(this.value).draw();
            }
        });
    } );

    // 开启双击单元格编辑功能
    if (editUrl) {
        tableCellEditable(id);
    }

    return dataTableEasy;
}

// 添加数据
function handleAddSubmit() {
    let data = {};
    for(let item of dataTableEasy.columnsRecord) {
        data[item.data] = $(`input[name=${item.data}]`).val() || $(`select[name=${item.data}]`).val();
    }
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

// 创建表格头部
function createTableHeader(table, columns) {
    let thead = [];
    thead.push(`<thead>`);
    // 添加顶部搜索框
    let theadSearch = [`<tr>`];
    let searchable = false;
    for (let i = 0; i < columns.length; i++) {
        // 判断本列是否开启搜索功能
        if (!columns[i].searchable) {
            theadSearch.push(`<th></th>`);
        } else {
            theadSearch.push(`<th><input columns="${i}" class="form-control input-sm" type="text" placeholder="筛选 ${columns[i].data}"></th>`);
            searchable = true;
        }
    }
    theadSearch.push(`</tr>`);
    // 如果所有列都没有开启搜索功能，取消显示
    if (searchable) {
        thead.push(theadSearch);
    }
    // 添加表格表头
    for (let item of columns) {
        thead.push(`<th>${item.data}</th>`);
    }
    thead.push(`</tr></thead>`);
    table.html(thead.join(''));
}

// 添加表格功能按钮
function createTableButton(table, buttonSet) {
    let buttons = [];
    const addButton = {
        text: 'Add',
        action: ( e, dt, node, config ) => {
            let modal = [`<div id="addModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"><div class="modal-dialog" role="document"><div class="modal-content">`];
            modal.push(`<div class="ibox-content"><form onsubmit="return handleAddSubmit();" method="get" class="form-horizontal">`);
            for (let item of dataTableEasy.columnsRecord) {
                if (item.data === 'id') {
                    continue;
                }
                modal.push(`<div style="display: block;margin-top: 10px;" class="form-group"><label class="col-sm-2 control-label">${item.data}</label>`);
                if (item.selectList) {
                    modal.push(`<div class="col-sm-10"><select name="${item.data}" class="form-control m-b">`);
                    for (let option of item.selectList) {
                        modal.push(`<option value="${option.value}">${option.name}</option>`);
                    }
                    modal.push(`</select>`);
                } else {
                    modal.push(`<div class="col-sm-10"><input name="${item.data}" type="text" class="form-control"></div>`);
                }
                modal.push(`</div>`);
            }
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
            $.each (dt.rows({selected: true}).data(), (index, item) => {
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
    for (let item of buttonSet) {
        switch (item) {
            case 'add': buttons.push(addButton); break;
            case 'delete': buttons.push(deleteButton); break;
            case 'copy': buttons.push(copyButton); break;
            case 'csv': buttons.push(csvButton); break;
            case 'excel': buttons.push(excelButton); break;
            case 'pdf': buttons.push(pdfButton); break;
            case 'print': buttons.push(printButton); break;
        }
    }
    return buttons;
}

// 开启单元格双击编辑功能
function tableCellEditable(id) {
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
        let column = dataTableEasy.columnsRecord[cell[0][0].column];
        if (column.selectList) {
            let select = [`<select columns="${cell[0][0].column}" class="form-control input-sm" id="tempSelect" onblur="editOnblur(this);" onchange="editOnChange(this);">`];
            for (let item of column.selectList) {
                let selected = '';
                if (cell.data() === item.name) {
                    selected = 'selected';
                }
                select.push(`<option ${selected} value="${item.value}">${item.name}</option>`)
            }
            select.push(`</select>`);
            cell.data(select.join(''));
            $('#tempSelect').focus();
            return;
        }

        // 否则是input text
        let val = cell.data(); // 记录之前的值，方便将光标定位到后面
        cell.data(`<input columns="${cell[0][0].column}" class="form-control input-sm" id="tempInput" type="text" value="${cell.data()}" onchange="editOnChange(this)" onblur="editOnblur(this);"/>`);
        $('#tempInput').val("").focus().val(val); // 将光标定位到后面
    });
}

// 单元格编辑，上传服务器
function editOnChange(dom) {
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
                editOnblur(dom);
            }catch(e){
            }
        }
    });
}

// 单元格编辑，失焦关闭可输入表单
function editOnblur(dom) {
    let text = $(dom).val();
    for (let item of dataTableEasy.columnsRecord[$(dom).attr('columns')].selectList) {
        if (item.value === text) {
            text = item.name;
        }
    }
    dataTableEasy.cell($(dom).parent()[0]).data(text);
}
