import { useRecoilState } from 'recoil';
import { mainEvents } from '../data/event-mainpage';
import { eventIdState } from '../state/recoilstate';

const EventPage = () => {
    const [eventId, setEventId] = useRecoilState(eventIdState);
    const event = mainEvents.find(x => x.eventId === eventId);
    return <>
        {event &&
            <div>
                <div className="flex flex-col items-center justify-center bg-white bg-opacity-25 rounded-xl shadow-xl p-4 backdrop-filter backdrop-blur-lg mt-10 mx-auto w-1/2">
                    <img src={event.imageUrl} alt="Image" className="h-80  object-contain" />
                    <div className='bg-white h-30 bg-opacity-25 rounded-xl shadow-xl p-4 backdrop-filter backdrop-blur-lg'>
                        <div className="text-center text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{event.eventName}</div>
                        <div className="text-center text-black">{event.date}</div>
                        <div className="text-center text-black overflow-hidden overflow-ellipsis whitespace-nowrap">{event.location}</div>
                        <div className="text-center text-black overflow-hidden overflow-ellipsis whitespace-nowrap">{event.description}</div>
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:bg-green-700 hover:bg-green-700">Apply</button>
                    </div>
                </div>
            </div>}
    </>;
}
export default EventPage;