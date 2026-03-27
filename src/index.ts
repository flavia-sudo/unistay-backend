import express from "express";
import user from "./user/user.router";
import auth from "./auth/auth.router";
import payment from "./payment/payment.router";
import booking from "./booking/booking.router";
import room from "./room/room.router";
import hostel from "./hostel/hostel.router";
import maintenance from "./maintenance/maintenance.router";
import review from "./review/review.router";
import cors from "cors";
import mpesaRoutes from "./mpesa/mpesa.router";

const initializeApp = () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    auth(app);
    user(app);
    payment(app);
    booking(app);
    room(app);
    hostel(app);
    maintenance(app);
    review(app);
    app.use('/api/mpesa', mpesaRoutes);
    app.get('/', (req, res) => {
        res.send('Welcome to hostel management API');
    })

    app.listen(process.env.PORT || 3000, () => console.log("Server is running on https://hostel-backend-fyy3.onrender.com"));
    return app;
}
const app = initializeApp();

export default app;