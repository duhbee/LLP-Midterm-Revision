/* Code-tracing questions ("what is the value / output?"). Past = from your quiz reviews.
   accept: normalised answers (lowercase, no spaces, no 0x). steps: worked solution. */
window.CODE = [];
(function () {
  let n = 0;
  const T = '.section .text\n.global _start\n_start:\n';
  const EXIT = '    movq $60, %rax\n    xorq %rdi, %rdi\n    syscall';
  function c(t, set, src, q, code, ans, accept, steps) {
    CODE.push({ id: 'c' + (++n), t, set, src, q, code, ans, accept, steps });
  }

  /* ---------- PAST QUIZ CODE QUESTIONS ---------- */
  c('t1', 'past', 'In-class Quiz 1 Q5', 'The program produces an output. What is it? (no whitespace)',
`.section .data
lbl_msg:
    .byte 'H', 'e', 'l', 'l', 'o', 10

.section .text
.global _start
_start:
    movq $1, %rax
    movq $1, %rdi
    movq $lbl_msg+1, %rsi
    movq $3, %rdx
    syscall
` + EXIT, 'ell', ['ell'],
`<ol><li>rax = 1 → <b>write</b>; rdi = 1 → stdout.</li><li>rsi = address of lbl_msg <b>+ 1</b> → starts at byte 1 = 'e' (byte 0 is 'H').</li><li>rdx = 3 → write 3 bytes: 'e','l','l'.</li><li>Output: <b>ell</b>.</li></ol>`);

  c('t3', 'past', 'In-class Quiz 2 Q5', 'Hex value of rax directly after line 6 (andq)? Uppercase, no 0x.',
`.section .text
.global _start
_start:
    movq $0xEF01ABC2CD458C92, %rax
    andq $0xFF00FF, %rax          # line 6
` + EXIT, '450092', ['450092'],
`<ol><li>Mask 0x<b>FF</b>00<b>FF</b> keeps byte 0 and byte 2, clears byte 1 and everything above byte 2.</li><li>rax low bytes: … CD <b>45</b> 8C <b>92</b>.</li><li>Keep 45 (byte 2), clear 8C (byte 1), keep 92 (byte 0) → 0x450092.</li></ol>`);

  c('t3', 'past', 'In-class Quiz 2 Q6', 'Hex value of rax directly after line 6 (orq)? Uppercase, no 0x.',
`.section .text
.global _start
_start:
    movq $0b1010100101, %rax
    orq  $0b110111, %rax          # line 6
` + EXIT, '2B7', ['2b7'],
`<ol><li>Line up right-aligned:<br><code>10 1010 0101</code><br><code>00 0011 0111</code> OR</li><li>= <code>10 1011 0111</code></li><li>Group nibbles from the right: 10 | 1011 | 0111 = 2 | B | 7 → <b>2B7</b>.</li></ol>`);

  c('t3', 'past', 'In-class Quiz 2 Q7', 'Hex value of rax directly after line 6 (xorq)? Uppercase, no 0x.',
`.section .text
.global _start
_start:
    movq $0b10011100, %rax
    xorq $0b11001001, %rax        # line 6
` + EXIT, '55', ['55'],
`<ol><li><code>1001 1100</code><br><code>1100 1001</code> XOR (1 where different)</li><li>= <code>0101 0101</code> = <b>0x55</b>.</li></ol>`);

  c('t3', 'past', 'Take-home 2 Q7', 'Value of r11 at the last line? Uppercase hex, no 0x, no leading zeros.',
T + `    movq $0x1234, %r10
    cmpq $0x5678, %r10
    jne  lbl_1
    movq $0xABCD, %r11
    jmp  lbl_end
lbl_1:
    movq $0xEFEF, %r11
lbl_end:
` + EXIT, 'EFEF', ['efef'],
`<ol><li>cmp computes r10 − 0x5678 = 0x1234 − 0x5678 ≠ 0 → not equal.</li><li><code>jne</code> (jump if not equal) is <b>taken</b> → skip to lbl_1.</li><li>r11 = <b>0xEFEF</b>.</li></ol>`);

  c('t4', 'past', 'Take-home 2 Q9', 'set_coords(&amp;s, x, y) must set s-&gt;x and s-&gt;y. Fill in the blank (no whitespace).',
`/* .c */
struct Spaceship {
    int  id;
    char callsign[10];
    int  x;
    int  y;
    int  life;
};
extern void set_coords(struct Spaceship *s, int x, int y);

/* .s */
set_coords:
    movl %edx, 20(%rdi)
    movl %esi, _____
    ret`, '16(%rdi)', ['16(rdi)'],
`<ol><li>Args: rdi = s (pointer), esi = x, edx = y.</li><li>Layout: id 0–3, callsign 4–13, padding 14–15 (next int must be at a multiple of 4), <b>x @16</b>, y @20, life @24.</li><li>y already stored at 20(%rdi); x goes to <b>16(%rdi)</b>.</li></ol>`);

  c('t4', 'past', 'Take-home 2 Q70', 'get_life(&amp;s) must return s-&gt;life. Fill in the blank (no whitespace).',
`/* same struct Spaceship as above:
   int id; char callsign[10]; int x; int y; int life; */
get_life:
    movl _____, %eax
    ret`, '24(%rdi)', ['24(rdi)'],
`<ol><li>id 0, callsign 4–13, pad 14–15, x 16, y 20, <b>life 24</b>.</li><li>Pointer in rdi → <b>24(%rdi)</b>; result in eax (return register).</li></ol>`);

  c('t4', 'past', 'Take-home 2 Q10', 'What does the program print?',
`/* .c */
unsigned int array[][3] = {{23, 66, -8}, {-40, 72, 12}, {-11, 34, 17}};
printf("%d\\n", func1(3, 3, array));

/* .s  — func1(rdi = rows, rsi = cols, rdx = array) */
func1:
    movl (%rdx), %eax         # eax = a[0]
    xorq %rcx, %rcx           # k = 0
    movl %edi, %r8d
    imull %esi, %r8d          # r8 = rows*cols = 9
lbl_loop_1:
    cmpq %r8, %rcx
    jge  lbl_loop_1_end       # stop when k >= 9
    movl (%rdx,%rcx,4), %r9d  # r9d = a[k]
    cmpl %eax, %r9d
    cmovg %r9d, %eax          # if a[k] > eax (signed): eax = a[k]
    incq %rcx
    jmp  lbl_loop_1
lbl_loop_1_end:
    ret`, '72', ['72'],
`<ol><li>It walks all 9 elements as one flat array (row-major).</li><li><code>cmovg</code> = <b>signed</b> greater → it keeps the signed maximum.</li><li>The "unsigned" −8, −40, −11 are bit patterns of negatives → treated as negative by the signed compare.</li><li>Max of 23, 66, −8, −40, 72, 12, −11, 34, 17 = <b>72</b>.</li></ol>`);

  c('t4', 'past', 'Take-home 2 Q13', 'Value of r8 at the last line? Uppercase hex, no 0x.',
T + `    movq $7, %rdi
    movq $8, %rsi
    cmpq %rsi, %rdi
    movq %rsi, %r8
    cmovg %rdi, %r8
` + EXIT, '8', ['8'],
`<ol><li>cmp rsi, rdi → test "rdi ? rsi" = 7 ? 8.</li><li>r8 = rsi = 8 first.</li><li>cmovg copies rdi only if 7 &gt; 8 — false → r8 stays <b>8</b>. (This is max(a,b).)</li></ol>`);

  c('t4', 'past', 'Take-home 2 Q18', 'Numerical value of r9 at the last line?',
T + `    xorl %r9d, %r9d
    xorl %ecx, %ecx
lbl_loop_start:
    cmpl $5, %ecx
    jge  lbl_end
    leal (%ecx,%ecx), %r8d
    addl %r8d, %r9d
    incl %ecx
    jmp  lbl_loop_start
lbl_end:
` + EXIT, '20', ['20'],
`<ol><li>r9 = 0, ecx = 0; loop while ecx &lt; 5.</li><li><code>leal (%ecx,%ecx)</code> = ecx + ecx = 2·ecx (no memory read).</li><li>r9 += 2·ecx for ecx = 0,1,2,3,4 → 0+2+4+6+8 = <b>20</b>.</li></ol>`);

  c('t3', 'past', 'Take-home 2 Q30', 'Value of r9 at the last line? Uppercase hex, no 0x.',
T + `    movq $5, %rsi
    movq $6, %rdi
    cmpq %rsi, %rdi
    jb   lbl_1
    movq $12, %r9
    jmp  lbl_end
lbl_1:
    movq $14, %r9
lbl_end:
` + EXIT, 'C', ['c'],
`<ol><li>cmp rsi, rdi → "rdi jb rsi" = is 6 below 5 (unsigned)? No.</li><li>Not taken → r9 = 12 = <b>0xC</b>.</li></ol>`);

  c('t3', 'past', 'Take-home 2 Q39', 'Value of r8 at the last line? Uppercase hex, no 0x.',
T + `    movq $0xABCD, %rdi
    movq $0, %rsi
    testq %rdi, %rdi
    je   lbl_1
    testq %rsi, %rsi
    je   lbl_1
    movq $0x2222, %r8
    jmp  lbl_end
lbl_1:
    movq $0x1111, %r8
lbl_end:
` + EXIT, '1111', ['1111'],
`<ol><li>This is <code>(a &amp;&amp; b) ? 0x2222 : 0x1111</code>.</li><li>test rdi,rdi: 0xABCD ≠ 0 → je not taken.</li><li>test rsi,rsi: 0 → ZF = 1 → je <b>taken</b> → r8 = <b>0x1111</b>.</li></ol>`);

  c('t3', 'past', 'Take-home 2 Q49', 'Value of r8 at the last line? Uppercase hex, no 0x.',
T + `    movq $-88, %rsi
    movq $-88, %rdi
    cmpq %rsi, %rdi
    jge  lbl_1
    movq $11, %r8
    jmp  lbl_end
lbl_1:
    movq $10, %r8
lbl_end:
` + EXIT, 'A', ['a'],
`<ol><li>"rdi jge rsi" → −88 ≥ −88? <b>Yes</b> (equal counts).</li><li>Jump taken → r8 = 10 = <b>0xA</b>.</li></ol>`);

  c('t3', 'past', 'Take-home 2 Q50', 'Numerical value of r8 at the last line?',
T + `    movq $0x6789, %rdi
    movq $0, %rsi
    testq %rdi, %rdi
    jne  lbl_1
    testq %rsi, %rsi
    jne  lbl_1
    xorq %r8, %r8
    jmp  lbl_end
lbl_1:
    movq $1, %r8
lbl_end:
` + EXIT, '1', ['1'],
`<ol><li>This is <code>a || b</code>.</li><li>rdi = 0x6789 ≠ 0 → jne <b>taken</b> immediately (short-circuit; rsi never tested).</li><li>r8 = <b>1</b>.</li></ol>`);

  c('t4', 'past', 'Take-home 2 Q51', 'What does the program print? (Many people answered 17 — watch the scale.)',
`/* .c */
unsigned int array[] = {7, 8, 9, 10, 11};
unsigned int int_n = 2;
printf("%d\\n", func1(int_n, array));

/* .s — func1(rdi = n, rsi = array) */
func1:
    xorq %rax, %rax
    xorq %rcx, %rcx
lbl_loop_1:
    cmpq %rdi, %rcx
    jge  lbl_loop_1_end
    movl (%rsi,%rcx,8), %edx
    addl %edx, %eax
    incq %rcx
    jmp  lbl_loop_1
lbl_loop_1_end:
    ret`, '16', ['16'],
`<ol><li>Loop runs for rcx = 0, 1 (n = 2).</li><li>Address = rsi + rcx × <b>8</b>, but each unsigned int is only 4 bytes, so scale 8 skips every other element.</li><li>rcx = 0 → byte 0 → a[0] = 7; rcx = 1 → byte 8 → <b>a[2]</b> = 9 (not a[1]).</li><li>7 + 9 = <b>16</b>.</li></ol>`);

  /* ---------- NEW PRACTICE PROGRAMS (same styles) ---------- */
  c('t3', 'new', 'New', 'Hex value of rax after the andq? Uppercase, no 0x.',
T + `    movq $0x12345678ABCD, %rax
    andq $0xF0F0, %rax
` + EXIT, 'A0C0', ['a0c0'],
`<ol><li>Mask keeps only the high nibble of the two lowest bytes.</li><li>0xABCD &amp; 0xF0F0: A→A, B→0, C→C, D→0 → <b>A0C0</b>. Everything above is cleared.</li></ol>`);

  c('t3', 'new', 'New', 'Hex value of rax after the orq? Uppercase, no 0x.',
T + `    movq $0b11001010, %rax
    orq  $0b00110101, %rax
` + EXIT, 'FF', ['ff'],
`<ol><li><code>1100 1010</code> | <code>0011 0101</code> = <code>1111 1111</code> (every bit is 1 in one of them).</li><li>= <b>0xFF</b>.</li></ol>`);

  c('t3', 'new', 'New', 'Hex value of rax after the xorq? Uppercase, no 0x, no leading zeros.',
T + `    movq $0xF0, %rax
    xorq $0xFF, %rax
` + EXIT, 'F', ['f', '0f'],
`<ol><li>XOR with 0xFF flips the low 8 bits.</li><li>1111 0000 → 0000 1111 = <b>0xF</b>.</li></ol>`);

  c('t3', 'new', 'New', 'Value of r11 at the end? Uppercase hex, no 0x.',
T + `    movq $5, %r10
    cmpq $5, %r10
    jne  lbl_1
    movq $0xAAAA, %r11
    jmp  lbl_end
lbl_1:
    movq $0xBBBB, %r11
lbl_end:
` + EXIT, 'AAAA', ['aaaa'],
`<ol><li>r10 − 5 = 0 → equal → <code>jne</code> NOT taken.</li><li>Falls through → r11 = <b>0xAAAA</b>.</li></ol>`);

  c('t4', 'new', 'New', 'Numerical (decimal, signed) value of r8 at the end?',
T + `    movq $-3, %rdi
    movq $4, %rsi
    cmpq %rsi, %rdi
    movq %rsi, %r8
    cmovl %rdi, %r8
` + EXIT, '-3', ['-3'],
`<ol><li>r8 = rsi = 4 first.</li><li>"rdi cmovl rsi": is −3 &lt; 4 (signed)? Yes → r8 = rdi = <b>−3</b>. (This is min(a,b).)</li></ol>`);

  c('t4', 'new', 'New', 'Numerical value of r9 at the end?',
T + `    xorl %r9d, %r9d
    movl $1, %ecx
loop:
    cmpl $4, %ecx
    jg   done
    addl %ecx, %r9d
    incl %ecx
    jmp  loop
done:
` + EXIT, '10', ['10'],
`<ol><li>Runs while ecx ≤ 4 (exits when ecx &gt; 4): ecx = 1, 2, 3, 4.</li><li>r9 = 1+2+3+4 = <b>10</b>.</li></ol>`);

  c('t3', 'new', 'New', 'Value of r9 at the end? Uppercase hex, no 0x.',
T + `    movq $-1, %rsi
    movq $1, %rdi
    cmpq %rsi, %rdi
    ja   lbl_1
    movq $0x10, %r9
    jmp  lbl_end
lbl_1:
    movq $0x20, %r9
lbl_end:
` + EXIT, '10', ['10'],
`<ol><li>"rdi ja rsi": is 1 above −1 <b>as unsigned</b>?</li><li>−1 unsigned = 0xFFFFFFFFFFFFFFFF, the biggest number → 1 is NOT above it.</li><li>Not taken → r9 = <b>0x10</b>. (With jg it would be 0x20.)</li></ol>`);

  c('t4', 'new', 'New', 'What does the program print?',
`/* .c */
unsigned int array[] = {3, 5, 7, 9, 11, 13};
printf("%d\\n", func1(3, array));

/* .s — func1(rdi = n, rsi = array) */
func1:
    xorq %rax, %rax
    xorq %rcx, %rcx
L:  cmpq %rdi, %rcx
    jge  E
    movl (%rsi,%rcx,8), %edx
    addl %edx, %eax
    incq %rcx
    jmp  L
E:  ret`, '21', ['21'],
`<ol><li>rcx = 0, 1, 2 (n = 3). Scale 8 on 4-byte ints → elements 0, 2, 4.</li><li>3 + 7 + 11 = <b>21</b>.</li></ol>`);

  c('t4', 'new', 'New', 'Fill in the blank so get_score returns s-&gt;score (no whitespace).',
`struct Player {
    int  id;
    char name[6];
    long score;
    int  level;
};
long get_score(struct Player *s);

get_score:
    movq _____, %rax
    ret`, '16(%rdi)', ['16(rdi)'],
`<ol><li>id 0–3, name 4–9, then <b>long needs 8-byte alignment</b> → pad 10–15.</li><li>score @16 (level @24, sizeof 32).</li><li>Answer <b>16(%rdi)</b>.</li></ol>`);

  c('t1', 'new', 'New', 'What does the program output? (no whitespace)',
`.section .data
lbl_msg:
    .byte 'W', 'o', 'r', 'l', 'd', 10
.section .text
.global _start
_start:
    movq $1, %rax
    movq $1, %rdi
    movq $lbl_msg+2, %rsi
    movq $2, %rdx
    syscall
` + EXIT, 'rl', ['rl'],
`<ol><li>write(1, lbl_msg+2, 2).</li><li>Byte 0 'W', 1 'o', <b>2 'r'</b>, 3 'l' → 2 bytes from offset 2 = <b>rl</b>.</li></ol>`);

  c('t3', 'new', 'New', 'Numerical value of r8 at the end?',
T + `    movq $0, %rdi
    movq $0, %rsi
    testq %rdi, %rdi
    jne  lbl_1
    testq %rsi, %rsi
    jne  lbl_1
    xorq %r8, %r8
    jmp  lbl_end
lbl_1:
    movq $1, %r8
lbl_end:
` + EXIT, '0', ['0'],
`<ol><li><code>a || b</code> with a = 0 and b = 0.</li><li>Both jne not taken → falls through → r8 = <b>0</b>.</li></ol>`);

  c('t2', 'new', 'New', 'Numerical value of rdx at the end?',
T + `    movq $6, %rax
    leaq 3(%rax,%rax,2), %rdx
` + EXIT, '21', ['21'],
`<ol><li>lea computes 3 + rax + rax×2 = 3 + 6 + 12.</li><li>= <b>21</b>. No memory is read.</li></ol>`);

  c('t3', 'new', 'New', 'Numerical (signed) value of rax after the sarq?',
T + `    movq $-16, %rax
    sarq $2, %rax
` + EXIT, '-4', ['-4'],
`<ol><li>sar by 2 = divide by 4, keeping the sign.</li><li>−16 / 4 = <b>−4</b> (1111 0000 → 1111 1100).</li></ol>`);

  c('t4', 'new', 'New', 'What does the program print?',
`/* .c */
int array[][3] = {{4, -2, 9}, {7, 0, -6}};
printf("%d\\n", func1(2, 3, array));

/* .s */
func1:
    movl (%rdx), %eax
    xorq %rcx, %rcx
    movl %edi, %r8d
    imull %esi, %r8d
L:  cmpq %r8, %rcx
    jge  E
    movl (%rdx,%rcx,4), %r9d
    cmpl %eax, %r9d
    cmovl %r9d, %eax
    incq %rcx
    jmp  L
E:  ret`, '-6', ['-6'],
`<ol><li>r8 = 2 × 3 = 6 elements, walked flat.</li><li><code>cmovl</code>: replace eax when a[k] &lt; eax (signed) → keeps the <b>minimum</b>.</li><li>min(4, −2, 9, 7, 0, −6) = <b>−6</b>.</li></ol>`);

  c('t3', 'new', 'New', 'Hex value of rax after the andq? Uppercase, no 0x.',
T + `    movq $0xDEADBEEF, %rax
    andq $0xFF00, %rax
` + EXIT, 'BE00', ['be00'],
`<ol><li>0xFF00 keeps only byte 1.</li><li>0xDEADBEEF: byte 0 = EF, <b>byte 1 = BE</b> → result <b>0xBE00</b>.</li></ol>`);

  /* make code questions available to the mock exam short-answer pool */
  CODE.forEach((x) => SAQ.push({
    id: 'sc' + x.id.slice(1), t: x.t, kind: 'a', code: true,
    text: x.q + '<pre class="code">' + x.code.replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;') + '</pre>',
    model: '<b>' + x.ans + '</b>' + x.steps, accept: x.accept, ref: x.src
  }));
})();
