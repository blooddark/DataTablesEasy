// 轻松实现dataTables常用功能
// 占用全局变量：dataTableEasy
// 依赖JQuery

function createDataTable(id, listUrl, columns, selectList) {
    let table = $(`#${id}`);

    // 创建表格头部
    let thead = [];
    thead.push(`<thead><tr>`);
    for (let i = 0; i < columns.length; i++) {
        thead.push(`<th>${columns[i].data}</th>`);
    }
    thead.push(`</tr></thead>`);
    table.html(thead.join(''));

    // 创建表格
    dataTableEasy = table.DataTable({
        ajax: {
            url: listUrl,
            dataSrc: 'data'
        },
        columns: columns,
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return data +' ('+ row['salary']+')';
                },
                "targets": 0
            }
        ]
    });

    // 绑定表格事件
    dataTableEasy.on( 'order.dt',  (e, settings, json) => { console.log( 'Order' ); } )
        .on( 'search.dt', (e, settings, json) => { console.log( 'Search' ); } )
        .on( 'page.dt',   (e, settings, json) => { console.log( 'Page' ); } );

    // 双击单元格开启编辑功能
    $(`#${id} tbody`).on('dblclick', 'td', (e) => {
        let cell = dataTableEasy.cell(e.currentTarget);
        if (cell.data().indexOf('<input') !== -1 || cell.data().indexOf('<select>') !== -1) {
            return;
        }
        for (let index in selectList) {
            if (cell[0][0].column === selectList[index].columnNumber) {
                let select = [`<select id="tempSelect" onblur="editOnblur(this);" onchange="editOnblur(this);">`];
                for (let valueIndex in selectList[index].values) {
                    let selected = '';
                    if (cell.data() === selectList[index].values[valueIndex].name) {
                        selected = 'selected';
                    }
                    select.push(`<option ${selected} value="${selectList[index].values[valueIndex].name}">${selectList[index].values[valueIndex].name}</option>`)
                }
                select.push(`</select>`);
                cell.data(select.join(''));
                $('#tempSelect').focus();
                return;
            }
        }
        let val = cell.data(); // 记录之前的值，方便将光标定位到后面
        cell.data(`<input id="tempInput" type="text" value="${cell.data()}" onblur="editOnblur(this);"/>`);
        $('#tempInput').val("").focus().val(val); // 将光标定位到后面
    });
}

function editOnblur(dom) {
    dataTableEasy.cell($(dom).parent()[0]).data($(dom).val());
}
