import { Outlet } from 'react-router-dom'
import Navbar from '../../components/NavBar/NavBar'


const UserLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default UserLayout