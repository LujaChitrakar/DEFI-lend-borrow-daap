import {Table} from "antd";

const LendContainer = () => {
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
      title: 'APY Interest Rate(%)',
      dataIndex: 'rate',
      key: 'rate',
    },
  ];

  const dataSource = [
    {
      key: '1',
      asset: 'Mike',
      age: 32,
      rate: 4.2,
    },
    {
      key: '2',
      asset: 'John',
      age: 42,
      rate: 5,
    },
  ];
  return (
    <div>LendContainer

<div>
        <Table columns={columns} dataSource={dataSource}/>
      </div>
    </div>
  )
}

export default LendContainer