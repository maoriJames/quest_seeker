import { Navigate } from 'react-router-dom'
import '../index.css'

const IndexPage = () => {
  console.log('Main page running?')

  const isLoggedIn = false // test variable
  const isAdmin = true // test variable

  if (!isLoggedIn) {
    return <Navigate to="/auth" />
  }

  if (!isAdmin) {
    return <Navigate to="/user" />
  }

  return <div>Welcome, Admin!</div>
}

export default IndexPage
