// 轻松实现dataTables常用功能
// 占用全局变量：dataTableEasy
// 依赖JQuery、BootStrap

let dataTableEasy;
// 创建数据表格
function createDataTable(id, listUrl, columns, addUrl, editUrl, deleteUrl, buttonList,
                         serverSide = true, processing = true, deferRender = true, select = true, responsive = true,
                         dom = '<"html5buttons"B>lTfgitp') {
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
        if (item.renderFun) {
            if (item.isDate) {
                item.renderDecorator = (data, type, row) => {
                    if (data.indexOf("input") === -1) {
                        return item.renderFun(data, type, row);
                    } else {
                        return data;
                    }
                };

                columnDefs.push({
                    render: item.renderDecorator,
                    targets: index
                })
            } else {
                columnDefs.push({
                    render: item.renderFun,
                    targets: index
                })
            }
        } else if (item.selectList) {
            columnDefs.push({
                render: (data, type, row) => {
                    for (let select of item.selectList) {
                        if (select.value === data) {
                            return select.name;
                        }
                    }
                    return data;
                },
                targets: index
            })
        } else if (item.radioList) {
            columnDefs.push({
                render: (data, type, row) => {
                    for (let radio of item.radioList) {
                        if (radio.value === data) {
                            return radio.name;
                        }
                    }
                    return data;
                },
                targets: index
            })
        } else if (item.isDate) {
            columnDefs.push({
                render: (data, type, row) => {
                    if (data.indexOf("input") === -1) {
                        return new Date(data).Format('yyyy-MM-dd');
                    } else {
                        return data;
                    }
                },
                targets: index
            })
        }
    });

    // 创建表格
    dataTableEasy = table.DataTable({
        serverSide: serverSide,
        processing: processing,
        ajax: {
            url: listUrl,
            method: 'get',
            dataSrc: 'data'
        },
        columns: columns,
        deferRender: deferRender,
        columnDefs: columnDefs,
        select: select,
        responsive: responsive,
        dom: dom,
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
        $(`input[columns=${this[0][0]}], select[columns=${this[0][0]}]`).on( 'keyup change', function () {
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
            if (res.code === 0) {
                toastr.success('添加成功');
                dataTableEasy.ajax.reload(null, false);
                $('#addModal').modal('hide');
            } else {
                toastr.error(res.msg + ':' + res.code);
            }
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
            if (columns[i].selectList || columns[i].radioList) {
                theadSearch.push(`<th><select columns="${i}" class="form-control input-sm">`);
                theadSearch.push(`<option value="">筛选 ${columns[i].data}</option>`);
                for (let item of columns[i].selectList || columns[i].radioList) {
                    theadSearch.push(`<option value="${item.value}">${item.name}</option>`);
                }
                theadSearch.push(`</select></th>`);
            } else {
                theadSearch.push(`<th><input columns="${i}" class="form-control input-sm" type="text" placeholder="筛选 ${columns[i].data}"></th>`);
            }
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

// 添加表格功能按钮（包括添加功能和删除功能）
function createTableButton(table, buttonSet) {
    let buttons = [];
    const addButton = {
        text: 'Add',
        action: ( e, dt, node, config ) => {
            let modal = [`<div id="addModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel"><div class="modal-dialog" role="document"><div class="modal-content"><div class="ibox-content">`];
            modal.push(`<form onsubmit="return handleAddSubmit();" method="get" class="form-horizontal">`);
            for (let item of dataTableEasy.columnsRecord) {
                if (!item.data || item.data === 'id') {
                    continue;
                }
                modal.push(`<div style="display: block;margin-top: 10px;" class="form-group"><label class="col-sm-2 control-label">${item.title || item.addTitle || item.data}</label><div class="col-sm-10">`);
                if (item.addForm) {
                    modal.push(item.addForm(item));
                } else if (item.selectList) {
                    modal.push(`<select name="${item.data}" class="form-control m-b">`);
                    for (let option of item.selectList) {
                        modal.push(`<option value="${option.value}">${option.name}</option>`);
                    }
                    modal.push(`</select>`);
                } else if (item.radioList) {
                    for (let radio of item.radioList) {
                        modal.push(`<label style="padding-left: 20px;">${radio.name}<input style="margin-left: 10px;" name="${item.data}" type="radio" value="${radio.value}"/></label>`);
                    }
                } else if (item.isDate) {
                    modal.push(`<input name="${item.data}" type="date" class="form-control">`);
                } else {
                    modal.push(`<input name="${item.data}" type="text" class="form-control">`);
                }
                modal.push(`</div></div>`);
            }
            modal.push(`<div style="margin-top: 20px;" class="form-group">
                                <div class="col-sm-4 col-sm-offset-8">
                                    <button class="btn btn-primary" type="submit">Save changes</button>
                                </div>
                            </div>`);
            modal.push(`</form></div></div></div></div>`);
            table.append(modal.join(''));
            $('#addModal').modal().on('hide.bs.modal', (e) => {
                dt.ajax.reload(null, false);
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
                    if (res.code === 0) {
                        toastr.success('删除成功');
                        dt.ajax.reload(null, false);
                    } else {
                        toastr.error(res.msg + ':' + res.code);
                    }
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
            default: buttons.push(item);
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
        if (cell.data() && (cell.data().toString().indexOf('<input') !== -1 || cell.data().toString().indexOf('<select>') !== -1)) {
            return;
        }
        // 将静态文本变为可输入表单
        // 判断是否是select
        let column = dataTableEasy.columnsRecord[cell[0][0].column];
        if (column.selectList) {
            let select = [`<select name="${column.data}" columns="${cell[0][0].column}" class="form-control input-sm" id="tempSelect">`];
            for (let item of column.selectList) {
                let selected = '';
                if (cell.data() === item.value) {
                    selected = 'selected';
                }
                select.push(`<option ${selected} value="${item.value}">${item.name}</option>`)
            }
            select.push(`</select>`);
            cell.data(select.join(''));
            $('#tempSelect').focus();

            let selectDom = $(`select[name=${column.data}]`);
            selectDom.bind('change', selectDom[0], editOnChange);
            selectDom.bind('blur', selectDom[0], editOnblur);
        }
        // 判断是否为radio
        else if (column.radioList) {
            let radio = [];
            for (let item of column.radioList) {
                let checked = '';
                if (cell.data() === item.value) {
                    checked = 'checked id="tempRadio"';
                }
                radio.push(`&nbsp;&nbsp;&nbsp;&nbsp;${item.name}&nbsp;&nbsp;<input ${checked} name="${column.data}" 
                    columns="${cell[0][0].column}" type="radio" value="${item.value}"/>`);
            }
            cell.data(radio.join(''));

            for (let index in column.radioList) {
                let radioDom = $(`input[value=${column.radioList[index].value}]`);
                radioDom.bind('click', radioDom[0], editOnChange);
                radioDom.bind('blur', radioDom[0], editOnblur);
            }
            $('#tempRadio').focus();
        }
        // 判断是否为时间
        else if (column.isDate) {
            cell.data(`<input columns="${cell[0][0].column}" class="form-control input-sm" id="tempInput" type="date" value="${new Date(cell.data()).Format('yyyy-MM-dd')}"/>`);
            $('#tempInput').focus();

            let inputDom = $(`#tempInput`);
            inputDom.bind('change', inputDom[0], editOnChange);
            inputDom.bind('blur', inputDom[0], editOnblur);
        }
        // 否则是input text
        else {
            let val = cell.data(); // 记录之前的值，方便将光标定位到后面
            cell.data(`<input columns="${cell[0][0].column}" class="form-control input-sm" id="tempInput" type="text" value="${cell.data()}"/>`);
            $('#tempInput').val("").focus().val(val); // 将光标定位到后面

            let inputDom = $(`#tempInput`);
            inputDom.bind('change', inputDom[0], editOnChange);
            inputDom.bind('blur', inputDom[0], editOnblur);
        }
    });
}

// 单元格编辑，上传服务器
function editOnChange(e) {
    let dom = e.data;
    let column = dataTableEasy.columnsRecord[$(dom).attr('columns')];
    let data = {id: dataTableEasy.rows($(dom).parent()[0]).data()[0].id};
    if (column.isDate) {
        data[column.data] = new Date($(dom).val()).Format('yyyy-MM-dd');
    } else {
        data[column.data] = $(dom).val();
    }
    $.ajax({
        url: dataTableEasy.editUrl,
        method: 'put',
        data: data,
        success: (res) => {
            if (res.code === 0) {
                toastr.success('修改成功');
            } else {
                toastr.error(res.msg + ':' + res.code);
            }
        },
        error: (res) => {
            toastr.error('网络异常，或服务器出现故障')
        },
        complete: () => {
            editOnblur(e);
        }
    });
}

// 单元格编辑，失去焦点刷新列表
function editOnblur(e) {
    let dom = e.data;
    $(dom).unbind('blur', editOnblur);
    setTimeout(function () {
        dataTableEasy.ajax.reload(null, false);
    }, 100);
}

Date.prototype.Format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};
