import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package } from 'lucide-react';
import bannerImage from '/images/banner-image.jpeg';
import config from "../config"

const PackageCalculator = () => {
    const [activeTab, setActiveTab] = useState('pounds');
    const [weight, setWeight] = useState('');
    const [rate, setRate] = useState({ perPound: 5, perKg: 11 }); // Default rates
    const [cost, setCost] = useState(0);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/api/rates`);
                setRate(response.data);
            } catch (error) {
                console.error('Error fetching rates:', error);
            }
        };
        fetchRates();
    }, []);

    const calculateCost = () => {
        const ratePerUnit = activeTab === 'pounds' ? rate.perPound : rate.perKg;
        setCost(weight * ratePerUnit);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Banner */}
            <div className="relative w-full h-56 flex items-center justify-center text-white text-3xl font-bold bg-cover bg-center" style={{ backgroundImage: `url(${bannerImage})` }}>
                <span className="bg-black bg-opacity-50 px-4 py-2 rounded">Package Calculator</span>
            </div>
            
            {/* Breadcrumb */}
            <div className="px-4 py-2 text-gray-600 text-sm">
                <Link to="/" className="text-gray-500 hover:underline">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-orange/100">Calculator</span>
            </div>
            
            {/* Calculator Section */}
            <div className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-lg mt-6">
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => setActiveTab('pounds')} 
                        className={`px-4 py-2 rounded ${activeTab === 'pounds' ? 'bg-orange/100 text-white' : 'bg-gray-200'}`}
                    >
                        Pounds
                    </button>
                    <button 
                        onClick={() => setActiveTab('kilograms')} 
                        className={`px-4 py-2 rounded ${activeTab === 'kilograms' ? 'bg-orange/100 text-white' : 'bg-gray-200'}`}
                    >
                        Kilograms
                    </button>
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <Package className="w-16 h-16 text-gray-500" />
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={`Rate: $${activeTab === 'pounds' ? rate.perPound : rate.perKg} per ${activeTab}`}
                        className="mt-4 w-full px-4 py-2 border rounded focus:ring-orange/100 focus:outline-none"
                    />
                    <button className="mt-4 bg-orange/100 hover:bg-orange/90 text-white px-6 py-2 rounded transition" onClick={calculateCost}>Calculate</button>
                </div>

                {cost > 0 && (
                    <div className="mt-6 text-center text-lg font-bold">
                        Estimated Cost: <span className="text-orange/100">${cost.toFixed(2)} USD</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageCalculator;
