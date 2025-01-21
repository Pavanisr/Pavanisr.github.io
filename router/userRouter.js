import express from "express";
import { patientRegister,login, addNewAdmin, getAllDoctors, getUserDetails, logoutAdmin, logoutPatient, addNewDoctor,deleteDoctor} from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middleware/auth.js";


const router = express.Router();

router.post("/patient/register",patientRegister);
router.post("/login", login);
router.post("/admin/addnew",isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/admin/me",isAdminAuthenticated,getUserDetails);
router.get("/patient/me",isPatientAuthenticated,getUserDetails);
router.get("/admin/logout",isAdminAuthenticated,logoutAdmin);
router.get("/patient/logout",isPatientAuthenticated,logoutPatient);
router.post("/doctor/addnew",isAdminAuthenticated,addNewDoctor);
router.delete("/doctor/delete", deleteDoctor);


export default router;