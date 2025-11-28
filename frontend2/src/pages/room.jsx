// src/pages/Room.jsx
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

const Room = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const [remoteUsers, setRemoteUsers] = useState({}); 
  const [localName] = useState(localStorage.getItem("userName") || "You");
  const [allUsers, setAllUsers] = useState([localName]);

  useEffect(() => {
    let localStream;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socket.emit("join-room", { roomId, name: localName });

        socket.on("all-users", (users) => {
          users.forEach(({ socketId, name }) => {
            const peer = createPeer(socketId, stream);
            peersRef.current[socketId] = peer;

            setRemoteUsers((prev) => ({
              ...prev,
              [socketId]: { ...(prev[socketId] || {}), name },
            }));

            setAllUsers((prev) => {
              if (!prev.includes(name)) return [...prev, name];
              return prev;
            });
          });
        });

        socket.on("user-joined", ({ socketId, name }) => {
          setRemoteUsers((prev) => ({
            ...prev,
            [socketId]: { ...(prev[socketId] || {}), name },
          }));

          setAllUsers((prev) => {
            if (!prev.includes(name)) return [...prev, name];
            return prev;
          });

          console.log("User joined:", name);
        });

        socket.on("offer", handleReceiveOffer(stream));
        socket.on("answer", handleReceiveAnswer);
        socket.on("ice-candidate", handleNewICECandidate);
        socket.on("user-left", handleUserLeft);
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    return () => {
      socket.emit("leave-room", roomId);

      socket.off("all-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");

      Object.values(peersRef.current).forEach((peer) => peer.close());
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, [roomId, localName]);

  useEffect(() => {
    const names = Object.values(remoteUsers).map(u => u.name || "Unknown");
    console.log("Users currently in room:", [localName, ...names]);
    console.log("All users who joined:", allUsers);
  }, [remoteUsers, localName, allUsers]);

  const createPeer = (targetId, stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { target: targetId, candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      const [remoteStream] = e.streams;
      setRemoteUsers((prev) => ({
        ...prev,
        [targetId]: { ...(prev[targetId] || {}), stream: remoteStream },
      }));
    };

    peer.onnegotiationneeded = async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("offer", { target: targetId, sdp: peer.localDescription });
    };

    return peer;
  };

  const handleReceiveOffer = (stream) => async ({ sdp, caller }) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peersRef.current[caller] = peer;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { target: caller, candidate: e.candidate });
      }
    };

    peer.ontrack = (e) => {
      const [remoteStream] = e.streams;
      setRemoteUsers((prev) => ({
        ...prev,
        [caller]: { ...(prev[caller] || {}), stream: remoteStream },
      }));
    };

    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", { target: caller, sdp: peer.localDescription });
  };

  const handleReceiveAnswer = async ({ sdp, caller }) => {
    const peer = peersRef.current[caller];
    if (!peer) return;
    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleNewICECandidate = async ({ candidate, from }) => {
    const peer = peersRef.current[from];
    if (!peer) return;
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding ICE candidate", err);
    }
  };

  const handleUserLeft = (socketId) => {
    const peer = peersRef.current[socketId];
    if (peer) peer.close();
    delete peersRef.current[socketId];

    setRemoteUsers((prev) => {
      const copy = { ...prev };
      delete copy[socketId];
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Room: {roomId}</h2>
      <h2 className="text-xl font-semibold mb-4">
        Back <Link to="/" className="text-indigo-400 hover:underline">Home</Link>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="relative">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full aspect-video bg-black rounded-xl" />
          <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">{localName}</span>
        </div>

        {Object.entries(remoteUsers).map(([socketId, { stream, name }]) => (
          <VideoTile key={socketId} stream={stream} name={name || socketId} />
        ))}
      </div>
    </div>
  );
};

const VideoTile = ({ stream, name }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative">
      <video ref={ref} autoPlay playsInline className="w-full aspect-video bg-black rounded-xl" />
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">{name}</span>
    </div>
  );
};

export default Room;
