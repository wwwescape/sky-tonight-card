import { css } from 'lit';

export const styles = css`   
    .sky-tonight {
        font-size: 12px;
    }
    .objects-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 10px;
        background-color: #162334;
        border-radius: 10px;
    }
    .objects-container .image-container img {
        width: 64px;
        height: 64px;
    }
    .objects-container .info-container {
        flex-basis: 70%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        height: 100%;
    }
    .objects-container .info-container .type-container,
    .objects-container .info-container .name-container,
    .objects-container .info-container .position-container {
        align-self: flex-start;
    }
    .objects-container .info-container .type-container .object-type {
        font-size: 16px;
    }
    .objects-container .info-container .type-container .object-type.planet {
        color: #f2896c;
    }
    .objects-container .info-container .type-container .object-type.dwarf-planet {
        color: #f2896c;
    }
    .objects-container .info-container .type-container .object-type.star {
        color: #B1B8FF;
    }
    .objects-container .info-container .type-container .object-type.moon {
        color: #BCD6EF;
    }
    .objects-container .info-container .name-container .object-name {
        font-size: 24px;
    }
    .objects-container .info-container .position-container .object-position {
        color: #b6c3d4;
        font-size: 16px;
    }
    .objects-container .icon-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-end;
        padding-right: 10px;
    }
    .objects-container .icon-container img {
        width: 16px;
        height: 16px;
        margin-bottom: 5px;
    }
    .summary-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        background-color: #162334;
        border-radius: 10px;
    }
    .summary-container .text-container {
        flex-basis: 50%;
        padding: 10px;
    }
    .summary-container .text-container span {
        color: #ffffff;
        font-size: 2rem;
    }
    .summary-container .text-container span.error-text {
        color: #ff0000;
        font-size: 16px;
    }
    .summary-container .icon-container {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        flex-basis: 50%;
        padding: 10px 10px 0 0;
    }
    .summary-container .icon-container img {
        width: 16px;
        height: 16px;
    }
    .summary-container .icon-container div {
        display: flex;
        align-items: center;
    }
    .summary-container .icon-container .icon-text {
        color: #b6c3d4;
        font-size: 16px;
        margin-left: 5px;
    }
`;
