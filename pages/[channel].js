import 'isomorphic-fetch';

import { useState } from 'react'; 

import Layout from '../components/Layout';
import ChannelGrid from '../components/ChannelGrid';
import PodcastList from '../components/PodcastList';
import PodcastPlayer from '../components/PodcastPlayer';

import Error from './_error';

const Channel = ({ channel, audioClips, series, statusCode }) => {

    const [openPodcast, setOpenPodcast] = useState(null);

    const handleOpenPodcast = (e, podcast) => {
        e.preventDefault();
        setOpenPodcast(podcast);
    }

    const handleClosePodcast = (e) => {
        e.preventDefault();
        setOpenPodcast(null);
    }

    if(statusCode !== 200) {
        return <Error statusCode={statusCode} />
    } 

    return (
        <Layout title={channel.title}>

            <div className="banner" style={{ backgroundImage: `url(${channel.urls.banner_image.original})` }} />

            { openPodcast && 
                <div className="modal">
                    <PodcastPlayer clip={ openPodcast } onClose={ handleClosePodcast } />
                </div> 
            }

            <h1>{ channel.title }</h1>

            { series.length > 0 &&
                <div>
                    <h2>Series</h2>
                    <ChannelGrid channels={series} />
                </div>
            }

            <h2>Ultimos Podcasts</h2>
            <PodcastList audioClips={audioClips} onClickPodcast={handleOpenPodcast}/>
        
            <style jsx>{`
                .banner {
                    width: 100%;
                    padding-bottom: 25%;
                    background-position: 50% 50%;
                    background-size: cover;
                    background-color: #aaa;
                }
                
                h1 {
                    font-weight: 600;
                    padding: 15px;
                }

                h2 {
                    padding: 5px;
                    font-size: 0.9em;
                    font-weight: 600;
                    margin: 0;
                    text-align: center;
                }

                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: black;
                    z-index: 99999;
                }
            `}</style>
        </Layout>
    )
}

export const getServerSideProps = async ({ params, res }) => {

    const idChannel = params.channel;

    try {

        const [reqChannel, reqAudios, reqSeries] = await Promise.all([
            fetch(`https://api.audioboom.com/channels/${idChannel}`),
            fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`),
            fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`)
        ])

        if(reqChannel.status > 400) {
            res.statusCode = reqChannel.status;
            return {props: {channel: null, audioClips: null, series: null, statusCode: reqChannel.status}}
        }
    
        let dataChannel = await reqChannel.json();
        let channel = dataChannel.body.channel;
    
        let dataAudios = await reqAudios.json();
        let audioClips = dataAudios.body.audio_clips;
    
        let dataSeries = await reqSeries.json();
        let series = dataSeries.body.channels;
    
        return {props: { channel, audioClips, series, statusCode: 200 }}
         
    } catch (e) {

        res.statusCode = 503;
        return {props: {channel: null, audioClips: null, series: null, statusCode: 503}}

    }  
} 

export default Channel;