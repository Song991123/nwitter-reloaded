import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;
const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
     border-radius: 50%;
     background-color: #1d9bf0;
     cursor: pointer;
     display: flex;
     justify-content: center;
     align-items: center;
    svg {
        width: 50px;
    }
`;
const AvatarImg = styled.img`
    width: 100%;
`;
const AvatarInput = styled.input`
    display:none; 
`;
const Name = styled.span`
    font-size: 22px;
`;
const Tweets = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);

    /**@name 아바타 변경
     * @description 아바타 변경하는 함수
     */
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, { photoURL: avatarUrl })
        }
    }
    /**@name 유저 타임라인 
     * @description 현재 로그인한 유저의 트윗만 보여줌
    */
    const fetchTweets = async () => {
        // 쿼리 생성
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userID", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );
        //스냅샷으로 불러오기
        const snapshot = await getDocs(tweetQuery);
        const loadTweet = snapshot.docs.map(doc => {
            const { photo, tweet, userID, username, createdAt } = doc.data();
            return {
                id: doc.id, photo, tweet, userID, username, createdAt
            };
        })
        setTweets(loadTweet);
    }
    useEffect(() => {
        fetchTweets();
    }, []);

    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {Boolean(avatar) ? <AvatarImg src={`${avatar}`} /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
                }
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            <Name>
                {user?.displayName ?? "Anonymous"}
            </Name>
            <Tweets>
                {tweets.map(tweet => <Tweet key={tweet.id} {...tweet}/>)}
            </Tweets>
        </Wrapper>
    )
}