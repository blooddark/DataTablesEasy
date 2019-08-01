let id = 'table';
let selectList = [{
    columnNumber: 2,
    values: [
        {
            name: '男',
            value: '男'
        },
        {
            name: '女',
            value: '女'
        },
    ]
}];
let listUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/list';
let editUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let deleteUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let addUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let columns = [
    { data: 'id' , editable: false},
    { data: 'username' },
    { data: 'gender' },
    { data: 'remark' }
];
let buttonList = ['add',
    'delete',
    'copy',
    'csv',
    'excel',
    'pdf',
    'print'];
createDataTable(id, listUrl, columns, selectList, editUrl, deleteUrl, addUrl, buttonList);
