import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Wifi, WifiOff } from 'lucide-react';

const ApiStatus = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            setIsChecking(true);
            const status = await api.checkHealth();
            setIsOnline(status);
            setIsChecking(false);
        };

        // Check initially
        checkStatus();

        // Poll every 30 seconds
        const interval = setInterval(checkStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`api-status-badge ${isOnline ? 'online' : 'offline'}`} title={isOnline ? "API Online" : "API Offline (Mock Server Stopped?)"}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="status-text">{isOnline ? 'System Online' : 'System Offline'}</span>
            <style>{`
                .api-status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .online {
                    background-color: #ECFDF5;
                    color: #10B981;
                    border: 1px solid #A7F3D0;
                    animation: pulse-green 2s infinite;
                }
                .offline {
                    background-color: #FEF2F2;
                    color: #EF4444;
                    border: 1px solid #FECACA;
                }
                .status-text {
                    white-space: nowrap;
                }
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @media (max-width: 768px) {
                    .status-text {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default ApiStatus;
