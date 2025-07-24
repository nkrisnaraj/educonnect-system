'use client';

import { useAuth } from "@/context/AuthContext";

export default function PayButton() {

    const { accessToken } = useAuth();
    const handlePayment = async () => {


        const paymentDetails = {
            order_id: `order_${Date.now()}`,
            amount: '500.00',
            currency: 'LKR',
            first_name: 'Charith',
            last_name: 'Wickramasinghe',
            email: 'charith@zhake.live',
            phone: '01162234050',
            address: '123 Main St',
            city: 'Colombo',
            country: 'Sri Lanka',
        };

        try {
            // ✅ Request hash from Django backend
            if (!accessToken) {
                alert("You're not logged in. Please login first.");
                return;
            }

            const res = await fetch('http://127.0.0.1:8000/students/api/initiate-payment/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },

                body: JSON.stringify(paymentDetails),
            });

            const { merchant_id, hash } = await res.json();

            const payment = {
                sandbox: true,
                merchant_id,
                return_url: `${window.location.origin}/students/payment/success`,
                cancel_url: `${window.location.origin}/students/payment/cancel`,
                notify_url: `https://francisco-saving-roots-suggests.trycloudflare.com/students/api/payment/notify/`,
                order_id: paymentDetails.order_id,
                items: 'Class Fees',
                amount: paymentDetails.amount,
                currency: paymentDetails.currency,
                ...paymentDetails,
                hash,
            };
            if (!merchant_id || !hash || !paymentDetails.order_id || !paymentDetails.amount) {
                console.error("Invalid PayHere payload:", payment);
                alert("Invalid payment data. Please try again.");
                return;
            }


            if (window.payhere) {
                console.log("PayHere payload:", payment);
                window.payhere.startPayment(payment);
            } else {
                alert("PayHere SDK not loaded");
            }
        } catch (err) {
            console.error('Payment error', err);
            alert("Payment failed");
        }
    };

    return (
        <button
            onClick={handlePayment}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Pay with PayHere
        </button>
    );
}
