import styled from "styled-components";

export const Card = styled.div`
  margin: 10px 5px;
  padding: 10px;
  border: 1px solid #d2e3ff;
  border-radius: 5px;
`;

export const Header = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
`;

export const Code = styled.pre`
  background: #e7f0ff;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
  color: #343d4c;
`;

export const Button = styled.button`
  display: block;
  margin: 10px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  width: calc(100% - 20px);
  background: #2e82ff;
  color: #ffffff;
  border-radius: 6px;
  line-height: 25px;
  text-align: center;
  border: none;
  transition: 0.2s ease;
  cursor: pointer;

  :hover {
    background: #2b76e7;
  }

  :active {
    background: #2468cd;
  }

  :disabled,
  [disabled] {
    border: 1px solid #999999;
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed !important;
  }
`;

export const Input = styled.input`
  outline-style: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 13px 14px;
  font-size: 14px;
  line-height: "22px";
  padding: "5px";
  transition: 0.2s ease;

  :focus {
    border-color: #2e82ff;
    outline: 0;
    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
      0 0 8px rgba(102, 175, 233, 0.6);
  }
`;

export const Panel = styled.div`
  background-color: #e7f0ff;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
`;
