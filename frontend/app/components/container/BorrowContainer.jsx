import {Table} from "antd";

const BorrowContainer = () => {
  const columns = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'APY Borrow Rate%',
      dataIndex: 'address',
      key: 'rate',
    },
  ];

  const dataSource = [
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];
  return (
    <div>BorrowContainer

<div style={{ width: '500px', height: '300px'}}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
         
          scroll={{ y: 240 }} 
          pagination={false}
        />
      </div>
    </div>
  )
}

export default BorrowContainer