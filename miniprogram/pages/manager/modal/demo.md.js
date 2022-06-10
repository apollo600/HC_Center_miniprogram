module.exports = `
## 正则表达式

### 创建一个正则表达式

使用一个正则表达式字面量，其由包含在斜杠之间的模式组成，如下所示：

\`\`\`
var re = /ab+c/;
\`\`\`

或者调用\`RegExp\`对象的构造函数，如下所示：

\`\`\`
var re = new RegExp("ab+c");
\`\`\`

### 编写一个正则表达式的模式

#### 使用简单模式

直接匹配
> 23333 哦i哈桑理发师的话ask来得及奥斯陆冬季ajdlaskdjsalkdjsajdlskadj

#### 使用特殊字符

##### 正则表达式中可以利用的特殊字符的完整列表和描述

[断言（Assertions）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions/Assertions)

表示一个匹配在某些条件下发生。断言包含先行断言、后行断言和条件表达式。

[字符类（Character Classes）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes)

区分不同类型的字符，例如区分字母和数字。

[组和范围（Groups and Ranges）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges)

表示表达式字符的分组和范围。

[量词（Quantifiers）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers)

表示匹配的字符或表达式的数量。

[Unicode 属性转义（Unicode Property Escapes）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes)

基于 unicode 字符属性区分字符。例如大写和小写字母、数学符号和标点。
`;
