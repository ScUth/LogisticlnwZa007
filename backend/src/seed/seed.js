import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { Sender, Recipient, Employee, Admin } from "../models/people.js";

async function InitializeDatabaseStructures() {
    try {
        const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

        const [Driver1pass, Driver2pass, Driver3pass] = await Promise.all([
            bcrypt.hash('111111', ROUNDS),
            bcrypt.hash("111111", ROUNDS),
            bcrypt.hash('111111', ROUNDS)
        ]);
        
        const Employees = await Employee.find({ employee_id: { $in: ["EMP0001", "EMP0002", "EMP0003"] } }, {_id: 1}).distinct("employee_id");
       if (Employees.length > 0) {
            console.log("Seed data already exists, dropping existing seed data", Employees);
            await Employee.deleteMany({ employee_id: { $in: Employees } });
        }

        await Employee.create([
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
        
        console.log("Seed data inserted successfully");
    } catch (error) {
        console.error("Error seeding database:", error.message);
        throw error;
    }
}

export default InitializeDatabaseStructures;