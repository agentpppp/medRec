import LandingPage from "./assets/components/LandingPage"
import PatientRegistation from "./assets/components/PatientRegistation"
import PatientList from "./assets/components/PatientList"
import SqlSerch from "./assets/components/SqlSerch"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const App = () => {

  return(
    <Router>
      <Routes>
      <Route path="/" element={<LandingPage/>}></Route>
      <Route path="/register" element={<PatientRegistation />} />
      <Route path="/registerd-Patient" element={<PatientList/>}/>
      <Route path="/SqlSerch" element={<SqlSerch/>}/>
      </Routes>
  
    </Router>

  )
}

export default App;

