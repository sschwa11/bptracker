import React from 'react';
import BlueprintCard from './BlueprintCard';
import blueprints from '../data/blueprints.json';

const BlueprintGrid = ({ userBlueprints = {}, onToggleBlueprint, isOverview = false, users = [], filteredUser = null, overviewMode = 'missing' }) => {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 p-4">
            {blueprints.map((bp) => (
                <BlueprintCard
                    key={bp.id}
                    blueprint={bp}
                    status={!isOverview ? (userBlueprints[bp.id] || 'unknown') : 'overview'}
                    onClick={() => onToggleBlueprint(bp.id)}
                    isOverview={isOverview}
                    users={users}
                    filteredUser={filteredUser}
                    overviewMode={overviewMode}
                />
            ))}
        </div>
    );
};

export default BlueprintGrid;
