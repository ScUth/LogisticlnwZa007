import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { Sender, Recipient, Employee, Admin } from "../models/people.js";
import { Vehicle } from "../models/operations.js";

async function InitializeDatabaseStructures() {
    try {
        const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

        const [Driver1pass, Driver2pass, Driver3pass] = await Promise.all([
            bcrypt.hash('111111', ROUNDS),
            bcrypt.hash("111111", ROUNDS),
            bcrypt.hash('111111', ROUNDS)
        ]);

        const Employees = await Employee.find({ employee_id: { $in: ["EMP0001", "EMP0002", "EMP0003"] } }, { _id: 1 }).distinct("employee_id");
        if (Employees.length > 0) {
            console.log("Seed data already exists, dropping existing seed data", Employees);
            await Employee.deleteMany({ employee_id: { $in: Employees } });
        }

        const createdEmployees = await Employee.create([
            {
                first_name: "ธีธัช",
                last_name: "สุเมธวัฒนะ",
                phone: "0942806742",
                password: Driver1pass,
                employee_id: "EMP0001",
                role: "courier"
            },
            {
                first_name: "กิตติศักดิ์",
                last_name: "ฉลองกุลวัฒน์",
                phone: "0817774745",
                password: Driver2pass,
                employee_id: "EMP0002",
                role: "courier"
            },
            {
                first_name: "ชานนท์",
                last_name: "เจียระมั่นคง",
                phone: "0909749562",
                password: Driver3pass,
                employee_id: "EMP0003",
                role: "courier"
            },
        ]);
        
        console.log("Created employees:", createdEmployees.map(e => ({ id: e._id, employee_id: e.employee_id, role: e.role })));

        // admin account
        const AdminPass = await bcrypt.hash('admin1234', ROUNDS);
        const adminExists = await Admin.findOne({ employee_id: "ADMIN001" });
        if (!adminExists) {
            await Admin.create({
                first_name: "Admin",
                last_name: "User",
                phone: "0000000000",
                password: AdminPass,
                employee_id: "ADMIN001",
            });
        }

        const vehicleExist = await Vehicle.findOne({ plate_no: ["1กข4567", "2ขค8901", "701234", "715555", "1กท999", "ผก3456"] });
        if (!vehicleExist) {
            await Vehicle.create([
                {
                    plate_raw: "1กข 4567",
                    plate_no: "1กข4567", // derived via normalizePlateNo
                    province: "กรุงเทพมหานคร",
                    vehicle_type: "pickup",
                    capacity_kg: 1000,
                    owner: "Company",
                    assigned_courier: null // Ready to be assigned
                },
                {
                    plate_raw: "2ขค 8901",
                    plate_no: "2ขค8901",
                    province: "นนทบุรี",
                    vehicle_type: "pickup",
                    capacity_kg: 1200,
                    owner: "Company",
                    assigned_courier: null
                },
                {
                    plate_raw: "70-1234",
                    plate_no: "701234", // Dashes removed by normalizer
                    province: "ปทุมธานี",
                    vehicle_type: "truck",
                    capacity_kg: 5000,
                    owner: "Company",
                    assigned_courier: null
                },
                {
                    plate_raw: "71-5555",
                    plate_no: "715555",
                    province: "สมุทรปราการ",
                    vehicle_type: "truck",
                    capacity_kg: 8000,
                    owner: "Company",
                    assigned_courier: null
                },
                {
                    plate_raw: "1กท 999",
                    plate_no: "1กท999",
                    province: "เชียงใหม่",
                    vehicle_type: "motorcycle",
                    capacity_kg: 40,
                    owner: "Company",
                    assigned_courier: null
                },
                {
                    plate_raw: "ผก 3456",
                    plate_no: "ผก3456",
                    province: "ชลบุรี",
                    vehicle_type: "pickup",
                    capacity_kg: 1100,
                    owner: "Company",
                    assigned_courier: null
                }
            ])
        }


        const HubExist = await mongoose.connection.db.collection("hubs").findOne({ hub_name: { $in: ["Chomphon Express Center", "Chan Kasem Drop-off", "Lat Yao Distribution Point", "Sena Nikhom Hub", "Chatuchak Hub"] } });
        let hubs = [];
        if (!HubExist) {
            const result = await mongoose.connection.db.collection("hubs").insertMany([
                {
                    hub_name: "Chomphon Express Center",
                    address_text: "102/3 Phahonyothin Road Soi 18",
                    sub_district: "Chom Phon", // Chomphon
                    active: true
                },
                {
                    hub_name: "Chan Kasem Drop-off",
                    address_text: "32/1 Ratchadaphisek Road",
                    sub_district: "Chan Kasem", // Chan Kasem
                    active: true
                },
                {
                    hub_name: "Lat Yao Distribution Point",
                    address_text: "88 Ngamwongwan Road",
                    sub_district: "Lat Yao", // Lat Yao
                    active: true
                },
                {
                    hub_name: "Sena Nikhom Hub",
                    address_text: "15 Prasert-Manukitch Road",
                    sub_district: "Sena Nikhom", // Sena Nikhom
                    active: true
                },
                {
                    // Chatuchak Hub - active example
                    hub_name: "Chatuchak Hub",
                    address_text: "123/45 Kamphaeng Phet 2 Road",
                    sub_district: "Chatuchak",
                    active: true
                },
            ]);
            
            // Get the inserted hub IDs
            const hubIds = Object.values(result.insertedIds);
            hubs = await mongoose.connection.db.collection("hubs").find({ _id: { $in: hubIds } }).toArray();
            console.log("Created hubs:", hubs.map(h => ({ id: h._id, name: h.hub_name })));
        } else {
            hubs = await mongoose.connection.db.collection("hubs").find({}).toArray();
            console.log("Found existing hubs:", hubs.map(h => ({ id: h._id, name: h.hub_name })));
        }
        
        // Create staff employees for each hub
        const staffPass = await bcrypt.hash('111111', ROUNDS);
        const existingStaff = await Employee.find({ role: "staff" }).select('employee_id current_hub');
        
        if (existingStaff.length === 0 && hubs.length >= 5) {
            // Generate employee IDs dynamically
            const lastEmployee = await Employee.findOne().sort({ employee_id: -1 }).select('employee_id');
            let nextNum = 1;
            if (lastEmployee) {
                const lastNum = parseInt(lastEmployee.employee_id.replace('EMP', ''));
                nextNum = lastNum + 1;
            }
            
            const generateNextEmpId = () => {
                const id = `EMP${String(nextNum).padStart(4, '0')}`;
                nextNum++;
                return id;
            };
            
            await Employee.create([
                {
                    first_name: "สมชาย",
                    last_name: "ใจดี",
                    phone: "0811111111",
                    password: staffPass,
                    employee_id: generateNextEmpId(),
                    role: "staff",
                    current_hub: hubs[0]._id // Chomphon Express Center
                },
                {
                    first_name: "สมหญิง",
                    last_name: "รักงาน",
                    phone: "0822222222",
                    password: staffPass,
                    employee_id: generateNextEmpId(),
                    role: "staff",
                    current_hub: hubs[1]._id // Chan Kasem Drop-off
                },
                {
                    first_name: "วิชัย",
                    last_name: "ขยัน",
                    phone: "0833333333",
                    password: staffPass,
                    employee_id: generateNextEmpId(),
                    role: "staff",
                    current_hub: hubs[2]._id // Lat Yao Distribution Point
                },
                {
                    first_name: "สุดา",
                    last_name: "มีชัย",
                    phone: "0844444444",
                    password: staffPass,
                    employee_id: generateNextEmpId(),
                    role: "staff",
                    current_hub: hubs[3]._id // Sena Nikhom Hub
                },
                {
                    first_name: "ประยุทธ",
                    last_name: "ทำงาน",
                    phone: "0855555555",
                    password: staffPass,
                    employee_id: generateNextEmpId(),
                    role: "staff",
                    current_hub: hubs[4]._id // Chatuchak Hub
                },
            ]);
            console.log("Created staff employees for all hubs with employee IDs starting from EMP", String(nextNum - 5).padStart(4, '0'));
        }

        console.log("Seed data inserted successfully");
    } catch (error) {
        console.error("Error seeding database:", error.message);
        throw error;
    }
}

export default InitializeDatabaseStructures;