import styled from "styled-components";
import { useRef, useState } from "react";
import { toast } from 'react-toastify';
import { doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";


/* ------------------- 디자인 ------------------- */
const Wrapper = styled.div``;

const BackgroundDiv = styled.div`
    background-color: rgba(91, 112, 131, 0.4);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
`;
const Form = styled.form`
    top: 0px;
    left: 0px;
    display: flex;
    width: 100%;
    background-color: black;
    position: absolute;
    border-radius: 15px;
    z-index: 1050;
    flex-direction: column;
`;
const TextArea = styled.textarea`
    padding: 20px;
    border: none;
    font-size: 16px;
    color:white;
    background-color: transparent;
    width: 80%;
    height: 200px;
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
const Photo = styled.img`
    width: 100px;
    height: 100px;
    position: absolute;
    right:20px;
    bottom :60px;
    cursor: pointer;
    &:not([src]) {
        border-radius: 0px;
        cursor: pointer;
        border: 1px solid;
        background-image: url("/plus.svg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 30%;
    }
`;
const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 0px 0px 15px 15px;
    font-size: 16px;
    cursor: pointer;
    &:hover, &:active{
        opacity: 0.9;
    }
`;
const EditTopBar = styled.div`
    height  : 50px;
    padding: 0px 18px;
    display: flex;
    align-items: center;
`;

const CancleBtn = styled.img`
    height: 20px;
    cursor: pointer;
`;

/* ------------------- 컴포넌트 ------------------- */
export default function EditTweet({ photo, tweet, id, setEditState }: { photo?: string; tweet: string; id: string, setEditState: (state: boolean) => void }) {
    // 변수 정의 =====================

    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    const isInvalidFileSize = (file: File) => file.size > MAX_FILE_SIZE;

    const [editTweet, setEditTweet] = useState(tweet);
    const [isLoading, setLoading] = useState(false);
    const [editPhoto, setEditPhoto] = useState(photo);
    const [editFile, setEditFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 함수 ===========================
    const handleClick = () => {
        fileInputRef.current?.click();
    }
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        if (files && files.length === 1) {
            if (isInvalidFileSize(files[0])) {
                toast.error("파일 크기가 너무 큽니다. 최대 1MB까지 업로드할 수 있습니다.");
                setEditFile(null);
            }
            else {
                // 수정 시 이미지 미리보기 설정
                const reader = new FileReader();
                reader.onload = (e) => {
                    setEditPhoto(e.target?.result as string);
                    setEditFile(files[0]);
                };
                reader.readAsDataURL(files[0]);
            }
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || isLoading || editTweet === "" || editTweet.length > 180)
            return;

        try {
            setLoading(true);
            // 트윗 수정
            const tweetRef = doc(db, "tweets", id);
            await updateDoc(tweetRef, {
                tweet: editTweet,
            });

            // 사진이 수정(추가)되었을 때
            if (editFile) {
                // 이미지 url 설정
                const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
                if (photo) {
                    await deleteObject(locationRef);
                }
                // storage에 이미지 업로드
                const result = await uploadBytes(locationRef, editFile);
                const url = await getDownloadURL(result.ref);
                await updateDoc(tweetRef, {
                    photo: url
                });
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
        setEditState(false);
    }

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditTweet(e.target.value);
    }

    const onCancle = () => {setEditState(false)}
    // 리턴값 ========================
    return (
        <Wrapper>
            <Form onSubmit={onSubmit}>
                <EditTopBar>
                    <CancleBtn src="/cancle.svg" onClick={onCancle}/>
                </EditTopBar>
                <TextArea value={editTweet} onChange={onChange} />
                <Photo src={editPhoto} onClick={handleClick} />
                <AttachFileInput ref={fileInputRef} onChange={handleFileChange} type="file" id="file" accept="image/*" />
                <SubmitBtn type="submit" value={isLoading ? "Editing..." : "Edit Tweet"} />
            </Form>
            <BackgroundDiv></BackgroundDiv>
        </Wrapper>
    )
}