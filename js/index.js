let id = 'table';
// let listUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/list';
// let editUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
// let deleteUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
// let addUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let listUrl = 'http://localhost:8080/user';
let editUrl = 'http://localhost:8080/user';
let deleteUrl = 'http://localhost:8080/user';
let addUrl = 'http://localhost:8080/user';
let columns = [
    { data: 'id' , editable: false, searchable: true,
        render: ( data, type, row ) => {
            return data +' ('+ row['remark']+')';
        }},
    { data: 'username', searchable: true},
    { data: 'gender' , searchable: true, radioList: [{name: '男',value: 1},{name: '女',value: 0}]},
    { data: 'remark', searchable: true, selectList: [{name: '备注1',value: '1'},{name: '备注2',value: '2'},
            {name: '备注3',value: '3'},{name: '备注4',value: '4'},{name: '备注5',value: '5'},{name: '备注6',value: '6'}]}
];
let buttonList = ['copy','csv', 'excel', 'pdf', 'print'];

createDataTable(id, listUrl, columns, addUrl, editUrl, deleteUrl, buttonList);
