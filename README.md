# 轻松实现dataTables常用功能
二次封装dataTables，轻松使用。对应后台参考：[Github](https://github.com/blooddark/DataTablesEasyServer)
## 创建数据表格 createDataTable
### 简单示例：     
html:   
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo</title>
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/datatables.min.css" rel="stylesheet">
    <link href="css/select.dataTables.min.css" rel="stylesheet">
    <link href="css/animate.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
    <link href="css/toastr.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/bootstrap.css">
</head>
<body>
<div id="wrapper">
    <div class="wrapper wrapper-content animated fadeInRight">
        <div class="row">
            <div class="ibox float-e-margins">
                <div class="ibox-content">
                    <div class="table-responsive">
                        <table id="table" class="table table-striped table-bordered table-hover dataTables-example" >
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="js/jquery.js"></script>
<script src="js/bootstrap.js"></script>
<script src="js/toastr.min.js"></script>
<script src="js/datatables.min.js"></script>
<script src="js/dataTables.select.min.js"></script>
<script src="js/dataTablesEasy.js"></script>
<script src="js/index.js"></script>
</body>
</html>

```
js:
```js
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
    { data: 'username', searchable: true},
    { data: 'gender' , searchable: true, radioList: [{name: '男',value: 'man'},{name: '女',value: 'woman'}]},
    { data: 'remark', selectList: [{name: '备注1',value: '1'},{name: '备注2',value: '2'}]}
];
let buttonList = ['copy','csv', 'excel', 'pdf', 'print'];

createDataTable(id, listUrl, columns, addUrl, editUrl, deleteUrl, buttonList);
```
### 参数说明
#### id （必须）
- 表格id，table标签的id。
- 格式：id 字符串
- 示例：`'table'`
#### listUrl （必须）
- 数据表格获取数据的URL，条件查询也是这个URL，请在后台实现分页和条件查询。
- 格式：URL 字符串
- 示例：`'https://www.easy-mock.com/mock/5d3fed7b8b554b4f4a4d0368/dataTables/list'`
#### columns （必须）
- 跟表格获取的数据对应的列名，表头。
- 格式：数组中是 `column` 对象，对象的 `data` 属性是列名，还有一些其他[可选参数](#可选参数说明)。
- 示例：
```js
let columns = [
    { data: 'id' , editable: false, searchable: true,
        render: ( data, type, row ) => {
            return data +' ('+ row['remark']+')';
        }},
    { data: 'username', searchable: true },
    { data: 'gender' , searchable: true, selectList: [{name: '男',value: '男'},{name: '女',value: '女'}]},
    { data: 'remark'}
]
```
#### columns 的可选参数
##### visible （columns可选）
是否显示本列，默认为true。
##### editable （columns可选）
是否开启此列双击编辑功能，默认开启，但需要 `editUrl`，如果没有 `editUrl` 此项不生效。
##### date （columns可选）
声明此列为日期，默认关闭。默认日期是不带时间的，如果需要时间请自行render，已实现日期格式化工具，直接使用即可。
示例：
```js
render: (data, type, row) => {
    return new Date(data).Format('yyyy-MM-dd hh:mm:ss');
},
```
##### searchable （columns可选）
是否开启此列搜索功能，默认关闭。如果开启，将在表头上方自动生成搜索框，实现搜索功能。
##### selectList （columns可选）
只在开启双击编辑功能时生效，如果编辑的项是下拉选择框，在这个参数内输入待选项的 `name` 和 `value`，
此参数有值则认为此列为下拉选择框，同时会影响到添加功能。
示例：`[{name: '备注1',value: '1'},{name: '备注2',value: '2'}]`
##### radioList （columns可选）
只在开启双击编辑功能时生效，如果编辑的项是下拉选择框，在这个参数内输入待选项的 `name` 和 `value`，
此参数有值则认为此列为单选框，同时会影响到添加功能。
示例：`[{name: '男',value: '男'},{name: '女',value: '女'}]`
##### render （columns可选）
函数参数，用于自定义列内容。当你开启 select 或 radio 时，render将自动实现。  
示例：
```js
render: (data, type, row) => {
    return data +' ('+ row['remark']+')';
}
```
#### addUrl （可选）
添加数据的接口，如果此项有值，则在最上方显示添加按钮，并实现添加功能。
#### editUrl （可选）
修改数据的接口，被双击编辑功能依赖，如果此项没有值，则编辑功能不可用。
#### deleteUrl （可选）
删除数据的接口，如果此项有值，则在最上方显示删除按钮，并实现删除功能。

此处删除功能的实现为，点击需要删除的行，然后点击删除按钮，将会执行删除功能。
#### buttonList （可选）
- 功能按钮列表，在最上方添加内置功能按钮。
- 格式：字符串数组
- 示例：
```js
let buttonList = ['copy','csv', 'excel', 'pdf', 'print']
```
##### 内置按钮说明
###### copy
复制数据表格内容到剪贴板。
###### csv
导出 csv 表格文件。
###### excel
导出 excel 表格文件。
###### pdf
导出 pdf 格式文件。
###### print
调起浏览器打印功能。
##### 按钮拓展说明
传入按钮对象即可：
```js
let buttons = [{
    text: 'Text',
    action: ( e, dt, node, config ) => {
    }
}]
```
### 数据传输格式说明
#### listUrl 接口
方法：get
##### 接收数据
示例：
```json
{   "recordsTotal":50,
    "recordsFiltered":50,
    "data":[{"id":1,"username":"Barbara Walker","gender":"男","remark":"1JE"},{"id":2,"username":"Karen Taylor","gender":"男","remark":"qOMMD"},{"id":3,"username":"Donna Allen","gender":"男","remark":"ar!eP[A"},{"id":4,"username":"Maria Robinson","gender":"男","remark":"bZmspF"},{"id":5,"username":"Richard Young","gender":"男","remark":"!V&gmhW"},{"id":6,"username":"Richard Martinez","gender":"女","remark":"Bvw6"},{"id":7,"username":"Helen Davis","gender":"女","remark":"&j7$E"},{"id":8,"username":"Ruth Rodriguez","gender":"女","remark":"UGv("},{"id":9,"username":"Kenneth Brown","gender":"女","remark":"RTF"},{"id":10,"username":"Susan Robinson","gender":"女","remark":"]6u(7@"}],
    "draw":"1"}
```
说明：
1. recordsTotal：记录总条数。
2. recordsFiltered： 经过条件查询后的总条数。
3. data：显示在表格中的数据。
4. draw：表明这是第几次查询，防止网络原因导致数据错误。
##### 上传数据
示例：
```
draw: 1
columns[0][data]: id
columns[0][name]: 
columns[0][searchable]: true
columns[0][orderable]: true
columns[0][search][value]: 
columns[0][search][regex]: false
columns[1][data]: username
columns[1][name]: 
columns[1][searchable]: true
columns[1][orderable]: true
columns[1][search][value]: 
columns[1][search][regex]: false
columns[2][data]: gender
columns[2][name]: 
columns[2][searchable]: true
columns[2][orderable]: true
columns[2][search][value]: 
columns[2][search][regex]: false
columns[3][data]: remark
columns[3][name]: 
columns[3][searchable]: true
columns[3][orderable]: true
columns[3][search][value]: 
columns[3][search][regex]: false
order[0][column]: 0
order[0][dir]: asc
start: 0
length: 10
search[value]: 
search[regex]: false
```
说明：
1. draw：表明这是第几次查询，防止网络原因导致数据错误。
2. columns：条件查询数组。
3. start：开始条数。
4. length：每页几条。
5. search：查询所有数据。
#### addUrl 接口
方法：post
##### 上传数据
按照column上传

示例：
```
id: 1
username:  Joseph Harris123
gender: 男
remark: 备注
```
#### editUrl 接口
方法：put
##### 上传数据
按照修改的column上传，并上传要修改的 id

示例：
```
id: 1
username: Joseph Harris123
```
#### deleteUrl 接口
方法：delete
##### 上传数据
上传要删除的 id 数组

示例：
```
id[]: 2
id[]: 3
```
