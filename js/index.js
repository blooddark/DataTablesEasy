let id = 'table';
let listUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/list';
let editUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let deleteUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let addUrl = 'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/success';
let columns = [
    { data: 'id' , editable: false, searchable: true,
        render: ( data, type, row ) => {
            return data +' ('+ row['remark']+')';
        }},
    { data: 'username', searchable: true },
    { data: 'gender' , searchable: true},
    { data: 'remark', selectList: [{name: '备注1',value: '1'},{name: '备注2',value: '2'}]}
];
let buttonList = ['copy','csv', 'excel', 'pdf', 'print'];

createDataTable(id, listUrl, columns, addUrl, editUrl, deleteUrl, buttonList);
