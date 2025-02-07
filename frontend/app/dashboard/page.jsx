import BorrowContainer from "../components/container/BorrowContainer"
import LendContainer from "../components/container/LendContainer"
const page = () => {
  return (
    <div className="flex justify-between">

      <BorrowContainer/>
      <LendContainer/> 
    </div>
  )
}

export default page