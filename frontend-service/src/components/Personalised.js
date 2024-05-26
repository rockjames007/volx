import { useRecoilState } from 'recoil';
import { personalisedState } from '../state/recoilstate';
import ConfirmationPopup from './ConfirmationPopup';
const PersonalisedPage = () => {
    const [personalised, setPersonalised] = useRecoilState(personalisedState);
    return <>
        <div className="grid grid-cols-3 gap-4 mb-8">
            {personalised.map((data, index) => (
                <div key={index} className="blue-card transform transition duration-500 ease-in-out hover:scale-105 hover:shadow-lg" onClick={() => {
                }}>
                    <div className="shadow-md p-4 flex flex-col items-center justify-center bg-white mb-4">
                        <img src={data.imageUrl} alt="Image" className="w-full h-24  object-cover" />
                        <div className='bg-white w-full h-30'>
                            <div className="text-left text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{data.category}</div>
                            <div className="text-left text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{data.eventName}</div>
                            <div className="text-left text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{data.location}</div>
                            <div className="text-left text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{data.date}</div>
                        </div>
                        {data.applied === true && (<div className="text-right text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">Applied</div>)}
                        {data.applied === false && (<button type="submit" onClick={() => {return <ConfirmationPopup prop={(setPersonalised(personalised.map(item => item === data ? {...item, applied: true} : item)))}/>}} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:bg-green-700 hover:bg-green-700">Apply</button>)}
                    </div>
                </div>
            ))}
        </div>
    </>;
}
export default PersonalisedPage;