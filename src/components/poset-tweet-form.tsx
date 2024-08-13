import { addDoc, collection, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GlobalStyle = createGlobalStyle`
    :root {
      --toastify-icon-color-error: #1d9bf0; /* 원하는 색상으로 변경 */
    }
    .Toastify__toast-icon {
        color: #1d9bf0; /* 아이콘 색상 */
    }

    .Toastify__progress-bar {
        background-color: #1d9bf0; /* 진행 바 색상 */
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;

`;

const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color:white;
    background-color: black;
    width: 100%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    
    &::placeholder{
        font-size: 16px;
    }
    &:focus{
        outline: none;
        border-color:#1d9bf0;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover, &:active{
        opacity: 0.9;
    }
`;

export default function PostTweetForm(){
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    const isInvalidFileSize = (file: File) => file.size > MAX_FILE_SIZE;

    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [file, setFile] = useState<File|null>(null);

    const onChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    }
    const onFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if(files && files.length === 1){
            if(isInvalidFileSize(files[0])){
                toast.error("파일 크기가 너무 큽니다. 최대 1MB까지 업로드할 수 있습니다.");
                setFile(null);
            }
            else{
                setFile(files[0]);
            }
        }
    }
    const onSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;

        if(!user || isLoading || tweet === "" || tweet.length > 140) return;

        try {
            setLoading(true);
            // document 추가 =======
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createdAt : Date.now(),
                username : user.displayName || "Anonymous",
                userID : user.uid,
            });
            // 만약 첨부된 파일이 있을 경우 =======
            if(file){
                // 이미지 url 설정
                const locationRef = ref(storage, `tweets/${user.uid}-${user.displayName}/${doc.id}`);
                // storage에 이미지 업로드
                const result = await uploadBytes(locationRef, file);
                // 업로드된 url 가져오기
                const url = await getDownloadURL(result.ref);
                // 기존 트윗에 file 추가
                await updateDoc(doc, {
                    photo: url
                });
            }
        } catch (error) {
            console.log(error);
        } finally{
            setLoading(false);
        }

        setTweet("");
        setFile(null);
    }
    return(
        <Form onSubmit={onSubmit}>
            <TextArea rows={5} maxLength={140} value={tweet} onChange={onChange} placeholder="What is happening?" required/>
            <ToastContainer />
            <GlobalStyle />
            <AttachFileButton htmlFor="file">
                {file ? "Photo added" : "Add photo"}
            </AttachFileButton>
            <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*"/>
            <SubmitBtn type="submit" value={isLoading? "Posting...": "Post Tweet"}/>
        </Form>
        
    );
}