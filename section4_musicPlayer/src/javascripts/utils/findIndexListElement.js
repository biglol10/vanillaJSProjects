// 리스트안에서 엘리먼트의 인덱스 번호를 찾는 함수
const findIndexListElement = (element) => {
  const listItems = element.parentElement.querySelectorAll("li");
  // listItems는 배열과 비슷할 뿐 실제론 배열이 아니기에 Array.prototype.slice 이용
  const currentIndex = Array.prototype.slice
    .call(listItems)
    .findIndex((listItem) => listItem === element);

  return currentIndex;
};

export default findIndexListElement;
