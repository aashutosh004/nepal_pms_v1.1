import React, { createContext, useState, useContext } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [uploadedTransactions, setUploadedTransactions] = useState([]);

    return (
        <TransactionContext.Provider value={{ uploadedTransactions, setUploadedTransactions }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransaction = () => useContext(TransactionContext);
