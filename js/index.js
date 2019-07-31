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
let columns = [
    { data: 'id' },
    { data: 'username' },
    { data: 'gender' },
    { data: 'remark' }
];
createDataTable(id, listUrl, columns, selectList);
