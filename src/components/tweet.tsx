import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import EditTweet from "./edit-tweet-form";
import { useState } from "react";

const Wrapper = styled.div`
    display: grid;
    grid-auto-rows: 22px 1fr;
    grid-template-columns: 3fr 1fr;
    grid-column:1/2;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
`;
const Column = styled.div``;

const Photo = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 15px;
`;
const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;
const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
`;

const ButtonDiv = styled.div`
    display: flex;
    gap:5px;
    justify-content: end;
    grid-area:1/1/1/3;
`;

const DeleteButton = styled.img`
    height: 20px;
    cursor: pointer;
`;

const EditButton = styled.img`
    height: 20px;
    cursor: pointer;
`;

export default function Tweet({ username, photo, tweet, userID, id }: ITweet) {
    const [editState, setEditState] = useState(false);
    const user = auth.currentUser;
    const onDelete = async () => {
        const deleteOk = confirm("Are you sure you want to delete this tweet?");
        if(!deleteOk || user?.uid !== userID) return;
        try {
            await deleteDoc(doc(db, "tweets", id));
            if(photo){
                const photoRef = ref(storage, `tweets/${userID}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (error) {
            console.log(error);
        } finally{

        }
    };
    const onEdit = () => {setEditState(true)};

    return (
        <>
            <Wrapper>
                <ButtonDiv>
                    { user?.uid === userID ? <EditButton src="/edit.svg" onClick={onEdit}/>: null }
                    { user?.uid === userID ? <DeleteButton src="/trash.svg" onClick={onDelete}/>: null }
                </ButtonDiv>
                <Column>
                    <Username>{username}</Username>
                    <Payload>{tweet}</Payload>
                </Column>
                <Column>
                    {photo ? (
                        <Photo src={photo} />
                    ) : null}
                </Column>
            </Wrapper>
            {editState? <EditTweet  photo={photo} tweet={tweet} id={id} setEditState={setEditState}/> : null}
        </>
    )
}