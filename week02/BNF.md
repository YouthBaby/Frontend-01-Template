四则运算产生式

<Number> = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

<DecimalNumber> = "0" | (("1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9") <Number>*)

<primaryExpression> = <DecimalNumber> | "(" <logicalExpression> ")"

<MutiplicativeExpression> = <DecimalNumber> | 

​		<MutiplicativeExpression>  "*" <DecimalNumber> |

​		<MutiplicativeExpression>  "/" <DecimalNumber>

<AdditiveExpression> = <MutiplicativeExpression> | 

​		<AdditiveExpression>  "+" <MutiplicativeExpression>

​		<AdditiveExpression>  "-" <MutiplicativeExpression>

<logicalExpression> = <AdditiveExpression> | 

​		<logicalExpression> "||" <AdditiveExpression>

​		<logicalExpression> "&&" <AdditiveExpression>

正则

<Number> = /0-9/

<DecimalNumber> = /0|\[1-9][0-9]/

