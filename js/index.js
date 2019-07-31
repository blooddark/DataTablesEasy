let id = 'table';
let selectList = [{
    columnNumber: 1,
    values: [
        {
            name: 'test1Name',
            value: 'test1Value'
        },
        {
            name: 'test2Name',
            value: 'test2Value'
        },
        {
            name: 'test3Name',
            value: 'test3Value'
        },
    ]
}];
let listUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/';
let columns = [
    { data: 'name' },
    { data: 'position' },
    { data: 'salary' },
    { data: 'office' }
];
createDataTable(id, listUrl, columns, selectList);
