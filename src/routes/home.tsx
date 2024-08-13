import styled from "styled-components";
import PostTweetForm from "../components/poset-tweet-form";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
    display: grid;
    gap: 50px;
    grid-template-rows: 1fr 5fr;
    overflow-y:scroll; 
    &::-webkit-scrollbar{
        display:none;
    }
`;

export default function Home() {

    return (
        <Wrapper>
            <PostTweetForm/>
            <Timeline/>
        </Wrapper>
    )
}