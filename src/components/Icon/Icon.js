import React from 'react';

const icon = (props) => {
    switch (props.type) {
        case 'add':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m30 29h16.5c0.8 0 1.5-0.7 1.5-1.5v-3c0-0.8-0.7-1.5-1.5-1.5h-16.5c-0.6 0-1-0.4-1-1v-16.5c0-0.8-0.7-1.5-1.5-1.5h-3c-0.8 0-1.5 0.7-1.5 1.5v16.5c0 0.6-0.4 1-1 1h-16.5c-0.8 0-1.5 0.7-1.5 1.5v3c0 0.8 0.7 1.5 1.5 1.5h16.5c0.6 0 1 0.4 1 1v16.5c0 0.8 0.7 1.5 1.5 1.5h3c0.8 0 1.5-0.7 1.5-1.5v-16.5c0-0.6 0.4-1 1-1z"></path></svg>;
        case 'close':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m31 25.4l13-13.1c0.6-0.6 0.6-1.5 0-2.1l-2-2.1c-0.6-0.6-1.5-0.6-2.1 0l-13.1 13.1c-0.4 0.4-1 0.4-1.4 0l-13.1-13.2c-0.6-0.6-1.5-0.6-2.1 0l-2.1 2.1c-0.6 0.6-0.6 1.5 0 2.1l13.1 13.1c0.4 0.4 0.4 1 0 1.4l-13.2 13.2c-0.6 0.6-0.6 1.5 0 2.1l2.1 2.1c0.6 0.6 1.5 0.6 2.1 0l13.1-13.1c0.4-0.4 1-0.4 1.4 0l13.1 13.1c0.6 0.6 1.5 0.6 2.1 0l2.1-2.1c0.6-0.6 0.6-1.5 0-2.1l-13-13.1c-0.4-0.4-0.4-1 0-1.4z"></path></svg>;
        case 'user':
            return <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 52 52"><path fill={props.color} d="m50 43v2.2c0 2.6-2.2 4.8-4.8 4.8h-38.4c-2.6 0-4.8-2.2-4.8-4.8v-2.2c0-5.8 6.8-9.4 13.2-12.2l0.6-0.3c0.5-0.2 1-0.2 1.5 0.1 2.6 1.7 5.5 2.6 8.6 2.6s6.1-1 8.6-2.6c0.5-0.3 1-0.3 1.5-0.1l0.6 0.3c6.6 2.8 13.4 6.3 13.4 12.2z m-24-41c6.6 0 11.9 5.9 11.9 13.2s-5.3 13.2-11.9 13.2-11.9-5.9-11.9-13.2 5.3-13.2 11.9-13.2z"></path></svg>;
        default:
            return null;
    }
};
 
export default icon;