import { useRecoilState } from 'recoil';
import { eventCategories} from '../data/event-mainpage';
import { eventIdState } from '../state/recoilstate';
import '../App.css';

const EventPage = () => {
    
    const [eventId] = useRecoilState(eventIdState);
  const event = eventCategories.find(x => x.eventId === eventId);
    return <>
        {event &&
            <div>
                <div className="bg-blue-500 min-h-screen flex flex-col"> <div className='flex items-center justify-center'><div className="items-left bg-white shadow-md rounded-lg p-8 max-w-md my-9 max-w-max">
                    <img src={event.imageUrl} alt="Image" className="h-80 object-contain" />
                    <div className='bg-white h-30 bg-opacity-25 rounded-xl shadow-xl p-4 backdrop-filter backdrop-blur-lg'>
                        <div className="text-center text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{event.eventName}</div>
                        <div className="text-center text-black">{event.date}</div>
                        <div className="text-center text-black overflow-hidden overflow-ellipsis whitespace-nowrap">{event.location}</div>
                        <div className="text-center text-black overflow-hidden overflow-ellipsis whitespace-nowrap">{event.description}</div>
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:bg-green-700 hover:bg-green-700">Apply</button>
                    </div></div></div>
                </div>
            </div>}
    </>;
}
export default EventPage;