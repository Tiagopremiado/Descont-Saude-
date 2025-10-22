import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ds-vinho"></div>
        </div>
    );
};

export default Spinner;