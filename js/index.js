let id = 'table';
let listUrl = 'http://localhost:8080/user';
let editUrl = 'http://localhost:8080/user';
let deleteUrl = 'http://localhost:8080/user';
let addUrl = 'http://localhost:8080/user';
let columns = [
    { data: 'id' , editable: false, visible: false},
    // { title: `<input type="checkbox" onchange="$('input[name=rowCheckBox]').prop('checked', $(this).prop('checked'));$(this).prop('checked') ? dataTableEasy.rows().select() : dataTableEasy.rows().deselect()"/>`,
    //     width: '10', editable:false, orderable: false, render: (data, type, row) => {
    //     return `<input name="rowCheckBox" type="checkbox"/>`;
    // }},
    { data: 'username',
        renderFun: ( data, type, row ) => {
            return data +' (测试)';
        }},
    { data: 'gender' , radioList: [{name: '男',value: 1},{name: '女',value: 0}]},
    { data: 'birthday', isDate: true, renderFun: (data) => {
            return new Date(data).Format('yyyy-MM-dd hh:mm:ss');
        }},
    { data: 'remark', selectList: [{name: '备注1',value: '1'},{name: '备注2',value: '2'},
            {name: '备注3',value: '3'},{name: '备注4',value: '4'},{name: '备注5',value: '5'},{name: '备注6',value: '6'}]}
];
let buttonList = ['copy','csv', 'excel', 'pdf', 'print', {
    text: '自定义按钮',
    action: () => {
        console.log('自定义按钮被点击');
    }
}];

createDataTable(id, listUrl, columns, addUrl, editUrl, deleteUrl, buttonList);
