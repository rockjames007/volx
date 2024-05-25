import React, { useState } from 'react';

function EnterVolunteersPage() {
    const [requiredVolunteers, setRequiredVolunteers] = useState(20);
    const [selectedVolunteers, setSelectedVolunteers] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSponsors, setSelectedSponsors] = useState([]);

    // Define the categories array
    const categories = [
        'Environment & Sustainability',
        'Health & Wellness',
        'Mental Health Support',
        'Animal Welfare',
        'Education & Literacy',
        'Social Services & Community Support',
        'Arts & Culture'
    ];

    // Function to generate a random interest level between 1 and 5
    const getRandomInterestLevel = () => Math.floor(Math.random() * 5) + 1;

    // Function to generate a random volunteer object
    let volunteerCount = 1;
    const generateRandomVolunteer = (category) => {
        const newVolunteer = {
            name: `Volunteer${volunteerCount}`,
            interestLevel: getRandomInterestLevel(),
            category: category
        };
        volunteerCount++;
        return newVolunteer;
    };

    // Function to handle automatching volunteers
    const handleAutomatchVolunteers = () => {
        // Generate volunteers based on the selected category and number provided
        const newVolunteers = [];
        for (let i = 0; i < requiredVolunteers; i++) {
            newVolunteers.push(generateRandomVolunteer(selectedCategory));
        }

        // Sort newVolunteers by interest level in descending order
        newVolunteers.sort((a, b) => b.interestLevel - a.interestLevel);

        // Filter selected volunteers based on the required number and interest levels
        const filteredVolunteers = [];
        let interestLevel = 5;
        while (filteredVolunteers.length < requiredVolunteers && interestLevel > 0) {
            const volunteersWithInterestLevel = newVolunteers.filter(volunteer => volunteer.interestLevel === interestLevel);
            const remainingSpace = requiredVolunteers - filteredVolunteers.length;
            if (volunteersWithInterestLevel.length <= remainingSpace) {
                filteredVolunteers.push(...volunteersWithInterestLevel);
            } else {
                filteredVolunteers.push(...volunteersWithInterestLevel.slice(0, remainingSpace));
            }
            interestLevel--;
        }

        // Update the selected volunteers state
        setSelectedVolunteers(filteredVolunteers);
    };

    const handleAutomatchSponsors = () => {
        // Generate sponsors based on the selected category and number provided
        const newSponsors = [];
        const sponsorNames = ['Sponsor1', 'Sponsor2', 'Sponsor3', 'Sponsor4', 'Sponsor5', 'Sponsor6', 'Sponsor7', 'Sponsor8', 'Sponsor9', 'Sponsor10'];
        for (let i = 0; i < sponsorNames.length; i++) {
            newSponsors.push({ name: sponsorNames[i], category: selectedCategory });
        }

        // Update the selected sponsors state
        setSelectedSponsors(newSponsors);
    };

    return (
        <div className="flex justify-between">
            {/* Left Side: Enter Required Volunteers */}
            <div className="flex flex-col w-1/2 p-4 border-r border-gray-300">
                <h2 className="mb-4">Enter Required Volunteers</h2>
                <input
                    type="number"
                    value={requiredVolunteers}
                    onChange={(e) => setRequiredVolunteers(parseInt(e.target.value))}
                    className="mb-2"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mb-2"
                >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
                <button onClick={handleAutomatchVolunteers} className="bg-blue-500 text-white py-2 px-4 rounded-md">
                    Automatch Volunteers
                </button>
            </div>
            {/* Right Side: Database of Selected Volunteers */}
            <div className="flex flex-col w-1/2 p-4">
                <h2 className="mb-4">Database of Selected Volunteers</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Category</th>
                            <th className="border px-4 py-2">Interest Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedVolunteers.map((volunteer, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{volunteer.name}</td>
                                <td className="border px-4 py-2">{volunteer.category}</td>
                                <td className="border px-4 py-2">{volunteer.interestLevel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col w-1/2 p-4">
                <h2 className="mb-4">Automatch Sponsors</h2>
                <button onClick={handleAutomatchSponsors} className="bg-blue-500 text-white py-2 px-4 rounded-md">
                    Automatch Sponsors
                </button>
            </div>
            {/* Database of Selected Sponsors */}
            <div className="flex flex-col w-1/2 p-4">
                <h2 className="mb-4">Database of Selected Sponsors</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedSponsors.map((sponsor, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{sponsor.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default EnterVolunteersPage;