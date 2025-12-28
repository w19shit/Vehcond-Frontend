//import { useState } from 'react'
import { Route, Routes,Navigate } from "react-router-dom";
import GuestRoutes from './components/routes/GuestRoutes';
import HomePage from './pages/home/HomePage';
import ContactUsPage from './pages/contactUs/ContactUsPage';
import DARoutes from './components/routes/DARoutes';
import UserProfilePage from './pages/user/profile/UserProfilePage';
import DADashboardPage from './pages/da/dashboard/DADashboardPage';
import VehicleRegistrationForm from './forms/users/VehicleRegistrationForm';
import SAD1Routes from "./components/routes/SAD1Routes";
import SAD2Routes from "./components/routes/SAD2Routes";
//import SAD2Page from "./pages/sad2/dashboard/SAD2Page";
import PoolParkedAllotmentPage from "./pages/sad2/dashboard/PoolParkedAllotmentPage";
import AllottedVehiclesPage from "./pages/sad2/dashboard/AllottedVehiclesPage";
import AllotedVehiclesPage from "./pages/sad1/dashboard/AllotedVehiclesPage";

import FowardToTransport from './pages/tableData/FinalListDisplay';

import './App.css'
import TDRoutes from './components/routes/TDRoutes';
import DraftListDisplay from './pages/tableData/DraftListDisplay';
import TDDashboard from './pages/td/dashboard/TDDashboard';
import ApprovedVehicles from './pages/MIS_reports/ApprovedVehicles';
import CirculationList from './pages/MIS_reports/CirculationList';
import Lifted from './pages/MIS_reports/Lifted';
import Scrapped from './pages/MIS_reports/Scrapped';
import ToBeApproved from './pages/td/actions/ToBeApproved';
import ToBePlaced from './pages/td/actions/ToBePlaced';
import PriceFixed from './pages/td/actions/PriceFixed';
import ToBeAllotted from './pages/td/actions/ToBeAllotted';
import TenderHeavyVehicles from './pages/td/actions/TenderHeavyVehicles'
import NonLifted from './pages/td/actions/NonLifted';
import CondemnationRecommended from './pages/MIS_reports/CondemnationRecommended';
import Tendered from './pages/MIS_reports/Tendered';
import Alloted from './pages/MIS_reports/Alloted';
import AdminRoutes from './components/routes/AdminRoutes';
import AdminDashboardPage from './pages/admin/dashboard/AdminDashboardPage';
import NonLiftedVehicles from './pages/MIS_reports/NonLiftedVehicles';
import RolePage from './pages/admin/actions/RolePage';
import DepartmentPage from './pages/admin/actions/DepartmentPage';
import DistrictPage from './pages/admin/actions/DistrictPage';
import DistrictRtoPage from './pages/admin/actions/DistrictRtoPage';
import FinancialYearPage from './pages/admin/actions/FinancialYearPage';
import VehicleManufacturerPage from './pages/admin/actions/VehicleManufacturerPage';
import VehicleTypePage from './pages/admin/actions/VehicleTypePage';
import VehiclePartPage from './pages/admin/actions/VehiclePartPage';
import ProcessPage from './pages/admin/actions/ProcessPage';
import UserCreationPage from './pages/admin/actions/UserCreationPage';
import ToBeLifted from './pages/da/To be Lifted/ToBeLifted';
import Status from './pages/td/actions/Status';
import DriverPage from './pages/admin/actions/DriverPage';
import VehicleFleetPage from "./pages/sad1/dashboard/VehicleFleetPage";
import DepartmentVehiclesPage from './pages/da/action/DepartmentVehiclesPage';
import RepairRequestPage from './pages/sad2/dashboard/RepairRequestPage';
import PendingRepairRequestsPage from './pages/td/dashboard/PendingRepairRequestsPage';
import VehicleRepairHistoryPage from './pages/td/dashboard/VehicleRepairHistoryPage';
import SAD2Page from "./pages/sad2/dashboard/SAD2Page";


const App = () => {
  return (
    <Routes>
      {/* Guest Routes */}
      <Route path="/" element={<GuestRoutes />}>
        <Route index element={<HomePage />} />
        <Route path="contact-us" element={<ContactUsPage />} />
      </Route>

      {/* Dealing Assistant Routes */}
      <Route path="/da" element={<DARoutes />}>

        {/* Dashboard */}
        <Route path="dashboard" element={<DADashboardPage />} />
        <Route path="dataentryvehicle" element={<VehicleRegistrationForm />} />
        
        <Route path="dataentryvehicle/edit/:draftId" element={<VehicleRegistrationForm />} />
       
        <Route path="listvehicledraft" element={<DraftListDisplay />} />
         
        <Route path="listforwardedtotransport" element={<FowardToTransport />} />
        
        <Route path="departmentvehicles" element={<DepartmentVehiclesPage />} />



        
        {/* Action -> To be lifted */}
        <Route path="listtobelifted" element={<ToBeLifted />} />

        {/* MIS Report */}
        {/* Approved Vehicles */}
        <Route path="listapprovedvehicles" element={<ApprovedVehicles />} />
        {/* Circulation List */}
        <Route path="listpricefixedbytc" element={<CirculationList />} />
        {/* Tender */}
        <Route path="listtender" element={<Tendered />} />
        {/* Lifted */}
        <Route path="listlifted" element={<Lifted/>} />
        {/* Scrap */}
        <Route path="listscrap" element={<Scrapped/>} />

        {/* Profile */}
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      {/* Transport Routes */}
      <Route path="/td" element={<TDRoutes />}>
        <Route path="dashboard" element={<TDDashboard />} />

        <Route path="pendingrepairrequests" element={<PendingRepairRequestsPage/>} />

        <Route path="vehiclerepairhistory" element={<VehicleRepairHistoryPage/>} />
        
        <Route path="drilldown" element={<Status/>} />
        {/* To Be Approved */}
        <Route path="listtobeapproved" element={<ToBeApproved/>} />

        {/* To Be Placed */}
        <Route path="listtobeplacedbeforevcc" element={<ToBePlaced />} />
        
        {/* Price as Fixed by TC */}
        <Route path="listpricetobefixed" element={<PriceFixed/>} />

        {/* To be Allotted */}
        <Route path="listtobeallotted" element={<ToBeAllotted/>} />

        {/* For Tender */}
        <Route path="listfortender" element={<TenderHeavyVehicles/>} />

        {/* Re-Allot / Declare Scrap / Tender (Non Lifted Vehicle) */}
        <Route path='listtodeclarescrap' element={<NonLifted/>} />







      {/* MSI Reports */}
        {/* Approved Vehicles */}
        <Route path = 'listapprovedvehicles' element={<ApprovedVehicles/>} />
        
        {/* Recommended for condemnation */}
        <Route path = 'listplacedbeforevcc' element={<CondemnationRecommended/>} />

        {/* Circulation List */}
        <Route path = 'listpricefixedbytc' element={<CirculationList/>} />

        {/* Allotted */}
        <Route path = 'listallotted' element = {<Alloted/>} />

        {/* Tender */}
        <Route path = 'listtender' element = {<Tendered />} />
        
        {/* Lifted */}
        <Route path = 'listlifted' element = {< Lifted/>} />
        
        {/* Scrap */}
        <Route path = 'listscrap' element = {< Scrapped />} />

        {/* Non Lifted */}
        <Route path = 'listnonlifted' element = {<NonLiftedVehicles />} />
      </Route>

      {/* Admin Routes */}
      <Route path ="/admin" element={<AdminRoutes />}>
        <Route path = "dashboard" element={<AdminDashboardPage />} />

      {/* Initialization */}
        {/* Role */}
        <Route path = 'role' element={<RolePage />} />

        {/* Drivers Page */}
          <Route path="drivers" element={<DriverPage />} />

        {/* Department */}
        <Route path = 'department' element = {<DepartmentPage />} />

        {/* District */}
        <Route path = 'district' element = {<DistrictPage />} />

        {/* District RTO */}
        <Route path = 'districtrto' element = {<DistrictRtoPage />} />

        {/* Financial Year */}
        <Route path = 'financialyear' element = {<FinancialYearPage />} />

        {/* Vehicle Manufacturer */}
        <Route path = 'vehiclemanufacturer' element = {<VehicleManufacturerPage />} />

        {/* Vehicle Type */}
        <Route path = 'vehicletype' element = {<VehicleTypePage />} />

        {/* Vehicle Part */}
        <Route path = 'vehiclepart' element = {<VehiclePartPage />} />

        {/* Process */}
        <Route path = 'process' element = {<ProcessPage />} />

      {/* Create UserLogin */}
        <Route path = 'createuserlogin' element = {<UserCreationPage />} />

      {/* MIS Reports*/}
        {/* Approved Vehicles */}
        <Route path = 'listapprovedvehicles' element={<ApprovedVehicles/>} />
        
        {/* Recommended for condemnation */}
        <Route path = 'listplacedbeforevcc' element={<CondemnationRecommended/>} />

        {/* Circulation List */}
        <Route path = 'listpricefixedbytc' element={<CirculationList/>} />

        {/* Allotted */}
        <Route path = 'listallotted' element = {<Alloted/>} />

        {/* Tender */}
        <Route path = 'listtender' element = {<Tendered />} />
        
        {/* Lifted */}
        <Route path = 'listlifted' element = {< Lifted/>} />
        
        {/* Scrap */}
        <Route path = 'listscrap' element = {< Scrapped />} />

        {/* Non Lifted */}
        <Route path = 'listnonlifted' element = {<NonLiftedVehicles />} />
      </Route>

      {/* SAD1 Routes */}
      <Route path="/sad1" element={<SAD1Routes />}>
        <Route path="dashboard" element={<VehicleFleetPage />} />

        {/* Vehicle Fleet Management */}
        <Route path="vehiclefleet" element={<VehicleFleetPage />} />
       
        <Route path="allotedvehicles" element={<AllotedVehiclesPage />} />
       </Route>
        {/* SAD2 Routes */}
      <Route path="/sad2" element={<SAD2Routes />}>

        <Route path="dashboard" element={<SAD2Page />} />

        <Route path="PoolParkedAllotment" element={<PoolParkedAllotmentPage />} />

        <Route path="allottedvehicles" element={<AllottedVehiclesPage />} />

        <Route path="repairrequest" element={<RepairRequestPage />} />

      </Route>

    </Routes>
  );
}

export default App
