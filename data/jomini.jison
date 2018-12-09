%{
var toDate = require('./toDate');
var setProp = require('./setProp');
%}

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
"#"[^\n]*(\n|<<EOF>>)       /* skip comments */
"yes"\b               return 'BOOL'
"no"\b                return 'BOOL'
[0-9]+"."[0-9]+"."[0-9]+\b return 'DATE'
'"'[0-9]+"."[0-9]+"."[0-9]+'"' yytext = yytext.substr(1,yyleng-2); return 'QDATE'
"-"?[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"{"                   return '{'
"}"                   return '}'
"hsv"                 return 'hsv'
"rgb"                 return 'rgb'
">="                   return 'GTE';
"<="                   return 'LTE';
">"                   return 'GT';
"<"                   return 'LT';
"="                   return '='
\"[^\"]*\"         yytext = yytext.substr(1,yyleng-2); return 'QIDENTIFIER'
[a-zA-Z0-9_\.:@]+          return 'IDENTIFIER'
"\r\n"
.                     return 'INVALID'
<<EOF>>               return 'EOF'


/lex

%left GTE GT LTE LT

%start expressions

%% /* language grammar */

expressions
    : PMemberList EOF
        { return obj; }
    | IDENTIFIER PMemberList EOF
        { return obj; }
    ;

PMemberList
    : PMember
        {if(key) {nest.push(obj); obj = {}; setProp(obj, key, value);}}
    | PMemberList PMember
        {if (key) {setProp(obj, key, value);}}
    ;

POperatorValue
    : NUMBER
        {$$ = +yytext;}
    | BOOL
        {$$ = yytext === 'yes';}
    | QIDENTIFIER
        {$$ = yytext;}
    | IDENTIFIER
        {$$ = yytext;}
    ;

POperatorMember
    : IDENTIFIER GTE POperatorValue
        {key = $1; value = { _operator: ">=", value: $3};}
    | QIDENTIFIER GTE POperatorValue
        {key = $1; value = { _operator: ">=", value: $3};}
    | IDENTIFIER GT POperatorValue
        {key = $1; value = { _operator: ">", value: $3};}
    | QIDENTIFIER GT POperatorValue
        {key = $1; value = { _operator: ">", value: $3};}
    | IDENTIFIER LTE POperatorValue
        {key = $1; value = { _operator: "<=", value: $3};}
    | QIDENTIFIER LTE POperatorValue
        {key = $1; value = { _operator: "<=", value: $3};}
    | IDENTIFIER LT POperatorValue
        {key = $1; value = { _operator: "<", value: $3};}
    | QIDENTIFIER LT POperatorValue
        {key = $1; value = { _operator: "<", value: $3};}
    ;

PMember
    : IDENTIFIER '=' PValue
        {key = $1; value = $3;}
    | QIDENTIFIER '=' PValue
        {key = $1; value = $3;}
    | '=' '=' PValue
        {key = $1; value = $3;}
    | POperatorMember
    | NUMBER '=' PValue
        {key = $1; value = $3;}
    | DATE '=' PValue
        {key = $1; value = $3;}
    | DATE '=' '{' '}'
        {key = $1; value = {};}
    | IDENTIFIER '=' '{' '}'
        {key = $1; value = {};}
    | '{' '}'
        {key = undefined;}
    ;

PList
    : PValue
        {nest.push(obj); obj = [$1];}
    | PList PValue
        {obj.push($2);}
    ;

PValue
    : NUMBER
        {$$ = +yytext;}
    | BOOL
        {$$ = yytext === 'yes';}
    | 'hsv' '{' NUMBER NUMBER NUMBER '}'
        {$$ = { h: +$3, s: +$4, v: +$5 };}
    | 'rgb' '{' NUMBER NUMBER NUMBER '}'
        {$$ = { r: +$3, g: +$4, b: +$5 };}
    | QIDENTIFIER
        {$$ = yytext;}
    | IDENTIFIER
        {$$ = yytext;}
    | DATE
        {$$ = toDate(yytext);}
    | QDATE
        {$$ = toDate(yytext);}
    | '{' PMemberList '}'
        {$$ = obj; obj = nest.pop();}
    | '{' PList '}'
        {$$ = obj; obj = nest.pop();}
    ;

%%

nest = [];
obj = {};
