/* CSD3116 Low-Level Programming — study notes, flashcards.
   Source: Weeks 1-6 lecture slides, quizzes, cheatsheets. */
window.TOPICS = [
  { id: 't1', n: '01', title: 'GNU assembly basics', sub: 'Syntax, registers, mov, memory, syscalls, printf', week: 'Week 1' },
  { id: 't2', n: '02', title: 'Addressing, ABI & stack', sub: 'Scaled index, lea, calling convention, frames', week: 'Week 1' },
  { id: 't3', n: '03', title: 'Bits, shifts & jumps', sub: 'and/or/xor/not, sal/sar, cmp, je/jg/ja, set', week: 'Week 2' },
  { id: 't4', n: '04', title: 'C to assembly', sub: 'cmov, loops, arrays, structs, alignment', week: 'Week 3' },
  { id: 't5', n: '05', title: 'Parallelism & perf', sub: 'Unrolling, SIMD, threads, mutex, perf stat', week: 'Week 4' },
  { id: 't6', n: '06', title: 'Pipelining & hazards', sub: 'FDEMW, speedup, data/control/structural', week: 'Week 5' },
  { id: 't7', n: '07', title: 'Superscalar CPUs', sub: 'IPC > 1, OoO, WAR/WAW, renaming', week: 'Week 5' },
  { id: 't8', n: '08', title: 'Cache', sub: 'Block/set/tag/offset, misses, tiling', week: 'Week 6' }
];

window.NOTES = {
t1: [
 { h: 'Assemblers: NASM vs GAS', html: `
<p>Course uses <b>GAS</b> (GNU Assembler, part of GCC). Both assemblers produce the same machine code.</p>
<table class="tbl"><tr><th></th><th>NASM</th><th>GAS</th></tr>
<tr><td>Syntax</td><td>Intel</td><td>AT&amp;T</td></tr>
<tr><td>File ext</td><td>.asm</td><td>.s</td></tr>
<tr><td>Comment</td><td><code>;</code></td><td><code>#</code></td></tr>
<tr><td>Register</td><td><code>rax</code></td><td><code>%rax</code></td></tr>
<tr><td>Immediate</td><td><code>60</code></td><td><code>$60</code></td></tr>
<tr><td>Memory</td><td><code>[rax]</code></td><td><code>(%rax)</code></td></tr>
<tr><td>Move</td><td><code>mov rax, rdi</code> (dest ← src)</td><td><code>movq %rdi, %rax</code> (src → dest)</td></tr></table>
<pre class="code"># gcc -g -nostdlib prog.s -o prog
.section .text
.global _start
_start:
    movq $60, %rax     # exit
    xorq %rdi, %rdi    # status 0
    syscall</pre>` },
 { h: 'Registers & sizes', html: `
<table class="tbl"><tr><th>64 (q)</th><th>32 (l)</th><th>16 (w)</th><th>8 (b)</th></tr>
<tr><td>rax</td><td>eax</td><td>ax</td><td>al</td></tr>
<tr><td>rbx rcx rdx</td><td>ebx ecx edx</td><td>bx cx dx</td><td>bl cl dl</td></tr>
<tr><td>rsi rdi rbp rsp</td><td>esi edi ebp esp</td><td>si di bp sp</td><td>sil dil bpl spl</td></tr>
<tr><td>r8 … r15</td><td>r8d …</td><td>r8w …</td><td>r8b …</td></tr></table>
<ul><li>Suffix = operand width: <b>b</b>=1 byte, <b>w</b>=2, <b>l</b>=4, <b>q</b>=8.</li>
<li>Float: 16 separate registers <b>xmm0–xmm15</b>, 128-bit, also used for SIMD. Instructions like <code>movsd</code>, <code>addsd</code>.</li>
<li>ISA defines registers, instructions (mov, add, sub, mul, call, ret, push, pop, syscall) and memory addressing.</li></ul>` },
 { h: 'mov rules', html: `
<ul><li><code>mov[size] src, dest</code>. Suffix = <b>destination</b> size.</li>
<li><b>No memory → memory.</b> At least one operand is a register (or src is an immediate).</li>
<li><code>movl $5, %eax</code> → writes 32-bit reg → <b>zero-extends</b> upper 32 bits: rax = 5.</li>
<li><code>movb $5, %al</code>, <code>movw …, %ax</code> → only that part changes; <b>no</b> zero-extension.</li>
<li><code>movq $0x1234, %rax</code> → rax = 0x0000000000001234.</li>
<li>Operand sizes must match: <code>movb %al, %bx</code> is invalid.</li></ul>
<table class="tbl"><tr><th>Other</th><th>Meaning</th></tr>
<tr><td><code>xorq %rcx,%rcx</code></td><td>rcx = 0 (fast zeroing)</td></tr>
<tr><td><code>subl %r9d,%edx</code></td><td>edx = edx − r9d</td></tr>
<tr><td><code>incq %r8</code></td><td>r8 += 1</td></tr>
<tr><td><code>cmpl %r9d,%edx</code></td><td>computes edx − r9d, sets flags only</td></tr>
<tr><td><code>pushq/popq</code></td><td>stack push / pop</td></tr></table>` },
 { h: 'Memory, little endian, gdb', html: `
<ul><li>Memory is <b>byte-addressable</b>; an address is 64 bits and fits in a register.</li>
<li><code>movq (%rax), %rbx</code> copies 8 bytes starting at address in rax.</li>
<li><b>Little endian</b>: lowest address holds least significant byte.</li></ul>
<pre class="code">addr  ...DEE0 AA   DEE1 BB   DEE2 CC   DEE3 DD
      ...DEE4 EE   DEE5 FF   DEE6 01   DEE7 02
movq (%rax),%rbx   →  rbx = 0x0201FFEEDDCCBBAA</pre>
<p>gdb: <code>x/1xb ADDR</code> 1 byte hex · <code>x/8xb ADDR</code> 8 bytes · <code>x/gx $rax</code> 8-byte word · <code>x/wd $rsp-4</code> one word decimal · <code>si</code> one instruction · <code>ni</code> step over call · <code>layout regs</code>.</p>
<p>"Hello\\n" in little endian as one 8-byte read: <code>0x0A6F6C6C6548</code>.</p>` },
 { h: 'System calls (Linux x86-64)', html: `
<table class="tbl"><tr><th>Reg</th><th>Purpose</th><th>Call #</th><th>Meaning</th></tr>
<tr><td>rax</td><td>syscall number (and return value)</td><td>0</td><td>read</td></tr>
<tr><td>rdi</td><td>arg 1</td><td>1</td><td>write</td></tr>
<tr><td>rsi</td><td>arg 2</td><td>2</td><td>open</td></tr>
<tr><td>rdx</td><td>arg 3</td><td>3</td><td>close</td></tr>
<tr><td>r10</td><td>arg 4 (<b>not</b> rcx)</td><td>60</td><td>exit</td></tr>
<tr><td>r8, r9</td><td>arg 5, 6</td><td></td><td></td></tr></table>
<ul><li><b>write(fd, buf, count)</b>: rdi = fd (0 stdin, 1 stdout, 2 stderr), rsi = buffer address, rdx = byte count. Returns bytes written in rax.</li>
<li><code>syscall</code> overwrites <b>rcx</b> (and r11). Does not touch the stack / rsp.</li>
<li>Writing more bytes than the buffer holds → out-of-bounds read, prints garbage.</li></ul>
<pre class="code">movq $1, %rax        # write
movq $1, %rdi        # stdout
leaq msg(%rip),%rsi  # address
movq $13, %rdx       # length
syscall</pre>` },
 { h: 'Calling printf from assembly', html: `
<table class="tbl"><tr><th>Where</th><th>What</th></tr>
<tr><td><code>%rdi</code></td><td>format string address</td></tr>
<tr><td><code>%rsi, %rdx, %rcx, %r8, %r9</code></td><td>data args 1–5 (ints, strings), then stack</td></tr>
<tr><td><code>%xmm0…</code></td><td>float / double args</td></tr>
<tr><td><code>%al</code> (rax)</td><td>number of xmm registers used = number of float args. 0 if none → <code>xorl %eax,%eax</code></td></tr></table>
<ul><li><code>printf("%d", x)</code>: rdi = fmt, <b>rsi</b> = x. <code>printf("%s", str)</code>: str address in <b>rsi</b>.</li>
<li><code>%x</code> prints hex. Passing a float in a GP register instead of xmm0 = wrong output.</li>
<li>printf is variadic. Before <code>call</code>: stack 16-byte aligned, save caller-saved regs you still need.</li></ul>` }
],
t2: [
 { h: 'Scaled index addressing', html: `
<p><b>D(Rb, Ri, S)</b> → effective address = <b>D + Rb + Ri × S</b></p>
<ul><li>D = displacement. Rb = base reg. Ri = index reg (<b>rsp cannot be index</b>). S ∈ <b>{1, 2, 4, 8}</b> only. If S=1 it may be omitted.</li>
<li>Scale = size of array element: int → 4, long/pointer/double → 8.</li></ul>
<table class="tbl"><tr><th>Given rdx=0xf000, rcx=0x100</th><th>Address</th></tr>
<tr><td><code>0x8(%rdx)</code></td><td>0xf008</td></tr>
<tr><td><code>(%rdx,%rcx)</code></td><td>0xf100</td></tr>
<tr><td><code>(%rdx,%rcx,4)</code></td><td>0xf400</td></tr>
<tr><td><code>0x80(,%rdx,2)</code></td><td>0x1e080</td></tr></table>
<div class="callout"><b>Check:</b> rax=100, rbx=5, <code>16(%rax,%rbx,8)</code> = 16 + 100 + 40 = <b>156</b>.</div>` },
 { h: 'lea — load effective address', html: `
<ul><li><code>leaq 8(%rax,%rcx,4), %rdx</code> → rdx = rax + 4·rcx + 8. <b>Memory is NOT accessed</b>. No flags changed.</li>
<li><code>movq (%rax), %rdx</code> reads memory. <code>leaq (%rax), %rdx</code> just copies rax.</li>
<li>Size suffix = destination size: <code>leal (%rdi,%rsi,4), %eax</code> keeps low 32 bits; <code>leaw …, %cx</code> 16-bit.</li>
<li>Used as cheap add / multiply: <code>leaq (%rax,%rax,4),%rdx</code> with rax=7 → <b>35</b> (5×7). Only ×1/2/4/8 scale.</li></ul>` },
 { h: 'System V ABI — registers', html: `
<table class="tbl"><tr><th>Role</th><th>Registers</th></tr>
<tr><td>Integer args, in order</td><td><code>rdi rsi rdx rcx r8 r9</code> (then stack, reverse order)</td></tr>
<tr><td>Float args</td><td><code>xmm0–xmm7</code></td></tr>
<tr><td>Return value</td><td><code>rax</code></td></tr>
<tr><td><b>Caller-saved</b> (callee may clobber)</td><td><code>rax rcx rdx rsi rdi r8–r11 xmm*</code></td></tr>
<tr><td><b>Callee-saved</b> (callee must preserve)</td><td><code>rbx rbp r12 r13 r14 r15</code></td></tr></table>
<ul><li><b>Caller-saved:</b> if you need it after a call, <b>you</b> save it before (e.g. push), restore after.</li>
<li><b>Callee-saved:</b> if you use it, <b>you</b> push at entry, pop before <code>ret</code>.</li>
<li>Prefer caller-saved regs for scratch in your own function. Never use rsp as scratch. Don't scratch rbp if you want a frame pointer.</li>
<li><code>rsp</code> must be the same before <code>call</code> and after <code>ret</code>.</li></ul>` },
 { h: '16-byte stack alignment', html: `
<ul><li><b>Just before executing <code>call</code>, rsp must be a multiple of 16.</b> (SIMD data may need 16-byte alignment; misaligned → segfault.)</li>
<li><code>call</code> pushes an 8-byte return address → on <b>function entry rsp ≡ 8 (mod 16)</b>, i.e. 8 bytes off a 16-byte boundary.</li>
<li>So inside a function: <code>subq $8,%rsp</code> (or push one reg) restores alignment before calling another function.</li>
<li>Locals: entry has rsp ≡ 8. Allocating <b>40</b> bytes (≡ 8 mod 16) → rsp ≡ 0 → <b>aligned, no extra adjustment</b>. Allocating 8 or 24 also aligns. Allocating 16 does not.</li>
<li>Pushing one callee-saved reg (8 bytes) at entry flips alignment to 0 → aligned. Push two → misaligned again.</li>
<li>Test: <code>testq $15, %rsp</code> → ZF=1 iff rsp divisible by 16 (low 4 bits zero).</li></ul>` },
 { h: 'Frame pointer & locals', html: `
<pre class="code">func:
    pushq %rbp          # save caller's rbp
    movq  %rsp, %rbp    # rbp = stable frame base
    subq  $16, %rsp     # locals
    movl  $10, -4(%rbp) # local var = 10
    ...
    leave               # movq %rbp,%rsp ; popq %rbp
    ret</pre>
<ul><li>rbp is stable while rsp moves with push/call. Helps debugging and stack unwinding.</li>
<li>After <code>pushq %rbp; movq %rsp,%rbp</code>: <b>0(%rbp)</b> = saved rbp, <b>8(%rbp)</b> = return address, <b>16(%rbp)</b> = first stack-passed arg. <b>Locals use negative offsets</b>.</li>
<li>Stack grows <b>downward</b>. Stack args use positive offsets from rbp.</li></ul>` }
],
t3: [
 { h: 'Bitwise operations', html: `
<table class="tbl"><tr><th>Op</th><th>Use</th><th>Example</th></tr>
<tr><td><b>and</b> <code>&amp;</code></td><td>mask / extract / clear / common bits</td><td>0xABCD &amp; 0xFF = 0xCD · 1101 &amp; 1010 = 1000</td></tr>
<tr><td><b>or</b> <code>|</code></td><td>set bits (force to 1)</td><td>1001 | 0x04 = 1101 · x | 0x80 → MSB = 1</td></tr>
<tr><td><b>xor</b> <code>^</code></td><td>toggle bits, find differing bits, zero a register</td><td>1001 ^ 1100 = 0101 · x ^ 0xFF = ~x · x^x = 0</td></tr>
<tr><td><b>not</b> <code>~</code></td><td>flip every bit</td><td>notb %al: 00110011 → 11001100 · ~0xCC = 0x33</td></tr></table>
<ul><li><code>op[size] opr1, opr2</code> → result stored in <b>opr2</b>.</li>
<li><code>testq a,b</code> = AND but <b>result not stored</b>, only flags. <code>testq %rdi,%rdi</code>: ZF=1 iff rdi==0.</li>
<li>C logical <code>&amp;&amp; ||</code> ≠ bitwise. They compile to test + jumps (short-circuit).</li>
<li>Bits are numbered from 0 at the LSB. Toggle bits 1 and 6 → mask 0100 0010 = 0x42.</li>
<li>NOT of a byte with k ones leaves 8−k ones.</li></ul>
<div class="callout"><b>Method (no calculator):</b> split hex into nibbles, write 4-bit binary for each, apply op bitwise, convert back. 0=0000 1=0001 2=0010 3=0011 4=0100 5=0101 6=0110 7=0111 8=1000 9=1001 A=1010 B=1011 C=1100 D=1101 E=1110 F=1111.</div>` },
 { h: 'Shifts', html: `
<ul><li><b>sal k, x</b> (shift left): fills <b>zeros</b> on the right. Multiplies by 2<sup>k</sup>. 0110 (6) sal 2 → 11000 (24).</li>
<li><b>sar k, x</b> (arithmetic right): <b>copies the sign bit</b> in on the left, preserving sign. Divides by 2<sup>k</sup>, fraction discarded (floor). 0110 sar 2 → 0001. −8 = 1111 1000 sar 2 → 1111 1110 = −2.</li>
<li>Uses: sal = fast multiply by power of 2, build masks (1 sal n). sar = divide by power of 2.</li>
<li>Compiler at -O2 turns ×2<sup>k</sup> into sal.</li></ul>` },
 { h: 'cmp, flags, set', html: `
<ul><li><code>cmpq opr1, opr2</code> computes <b>opr2 − opr1</b>, discards result, sets flags (ZF, SF, CF, OF…). <b>Always read it as "opr2 ___ opr1".</b></li>
<li><code>test</code> sets flags from AND.</li>
<li><code>sete/setne/setl…  dest</code> → dest = 1 if condition true else 0. <b>dest must be an 8-bit register or memory operand</b> (e.g. %al).</li></ul>
<table class="tbl"><tr><th>C expr</th><th>Signed</th><th>Unsigned</th></tr>
<tr><td>a == b</td><td>je / sete / cmove</td><td>same</td></tr>
<tr><td>a != b</td><td>jne / setne / cmovne</td><td>same</td></tr>
<tr><td>a &lt; b</td><td>jl / setl / cmovl</td><td>jb / setb / cmovb</td></tr>
<tr><td>a &lt;= b</td><td>jle / setle / cmovle</td><td>jbe / setbe / cmovbe</td></tr>
<tr><td>a &gt; b</td><td>jg / setg / cmovg</td><td>ja / seta / cmova</td></tr>
<tr><td>a &gt;= b</td><td>jge / setge / cmovge</td><td>jae / setae / cmovae</td></tr></table>
<div class="callout"><b>Memory aid:</b> <b>G</b>reater/<b>L</b>ess = <b>signed</b>. <b>A</b>bove/<b>B</b>elow = <b>unsigned</b>. e = equal. Using <code>ja</code> on signed ints, or <code>jl</code> on unsigned, gives wrong results (−1 = 0xFF…FF is "above" everything).</div>` },
 { h: 'Jumps & short-circuit logic', html: `
<pre class="code">cmpq opr1, opr2
je   lbl_eq        # taken if opr2 == opr1
# else-case code
jmp  lbl_end       # unconditional, ignores flags
lbl_eq:
# if-case code
lbl_end:</pre>
<ul><li><b>je</b> depends on the comparison result; <b>jmp</b> does not. If <code>je</code> not taken → values were not equal.</li>
<li>Only direct jumps to labels are examined.</li>
<li><b>a &amp;&amp; b</b>: test a; <code>je false</code>; test b; <code>je false</code>; result = 1; <code>jmp end</code>; false: result = 0. (uses je + jmp; b may not be evaluated).</li>
<li><b>a || b</b>: test a; <code>jne true</code>; test b; <code>jne true</code>; result = 0; <code>jmp end</code>; true: result = 1. (uses jne + jmp).</li>
<li>Loops = a branch back to an earlier label.</li></ul>` }
],
t4: [
 { h: 'From C to executable', html: `
<p><b>Edit → Preprocess → Compile → Assemble → Link → Executable</b></p>
<ul><li><b>Preprocess:</b> # directives, expand .h, replace macros, strip comments.</li>
<li><b>Compile:</b> C → assembly (.s). <code>gcc -O0 -S -masm=att prog.c -o prog.s</code></li>
<li><b>Assemble:</b> .s → machine code in object file (.o), may have unresolved externals.</li>
<li><b>Link:</b> combines object files + libc into executable.</li></ul>
<table class="tbl"><tr><th></th><th>-O0</th><th>-O2</th><th>-O3</th></tr>
<tr><td>Use</td><td>debugging (default)</td><td>most common production</td><td>explore further optimisation</td></tr>
<tr><td>Compile time</td><td>shortest</td><td>longer</td><td>longest</td></tr>
<tr><td>Code size</td><td>large/smallest*</td><td>optimised</td><td>can exceed O0 (unrolling, inlining, vectorisation)</td></tr>
<tr><td>Asm vs C</td><td>closely matches source</td><td>no longer resembles source</td><td>—</td></tr></table>
<ul><li>-O0 asm mirrors C → helps connect C ↔ asm (e.g. <code>movl $10,-4(%rbp)</code> = local variable assignment).</li>
<li>-O2 can fold work: <code>x+y</code> → <code>leal (%rdi,%rsi),%eax</code>; with constants the compiler may just load 30; may delete a whole loop (0+…+9 = 45) when the result is known without running it.</li>
<li><b>Why learn low-level when compilers optimise?</b> Compiler can't fix a bad algorithm; it's a one-off static optimisation (doesn't know future inputs / access patterns); you write cache-friendly code and debug.</li></ul>` },
 { h: 'Conditionals: branch vs cmov', html: `
<pre class="code">cmpq %rsi, %rdi     # rdi ? rsi
movq %rsi, %rax     # assume else: rax = b
cmovg %rdi, %rax    # if rdi > rsi (signed): rax = a    → max(a,b)</pre>
<ul><li><code>cmovX src, dst</code>: copies src → dst only if condition true. dst is a register.</li>
<li><b>Branch (cmp + jcc):</b> computes only the chosen result. Best when results are <b>costly</b> to compute and the branch is <b>predictable</b>.</li>
<li><b>cmov:</b> both results are computed first, no branch → no misprediction penalty. Best when both results are <b>cheap</b> and the condition is <b>unpredictable (random)</b>.</li>
<li>Branch predictor: pattern-based; wrong guess → flush + penalty. Sorted data → predictable.</li></ul>` },
 { h: 'Loops', html: `
<pre class="code">xorq %rcx,%rcx          # i = 0
top: cmpq %rdi,%rcx     # i vs n
     jge  end           # leave when i >= n
     ...body...
     incq %rcx          # i++
     jmp  top
end:</pre>
<ul><li>for and while both become: <b>cmp + conditional branch + backward jump</b>.</li>
<li>The cmp each iteration decides whether another iteration runs.</li>
<li>Misprediction is low in simple counting loops: the branch pattern is predictable (taken many times).</li></ul>` },
 { h: 'Arrays', html: `
<ul><li><b>1D:</b> <code>a[i]</code> = <code>(%rsi,%rcx,4)</code> for int (base + 4·i). Scale = element size. <b>Length must be passed as an argument</b> — assembly doesn't know it.</li>
<li><b>2D is row-major:</b> row 0 laid out first, then row 1 …. a[r][c], row i, col j:
<br><b>k = i·c + j</b> (flattened index, 0 … r·c − 1) · <b>i = k / c</b> · <b>j = k % c</b></li>
<li>Example int a[2][3]: a[1][2] → k = 1·3+2 = <b>5</b>. After a[0][2] comes a[1][0].</li>
<li>Summing a 2D array: one counter k from 0 to r·c−1 over contiguous memory → cache friendly (spatial locality).</li>
<li>Sequential access = spatial locality = fewer cache misses.</li></ul>` },
 { h: 'Structs, alignment & padding', html: `
<ul><li>Members are laid out <b>sequentially in declaration order</b> (never reordered).</li>
<li>A type must sit at an address divisible by its alignment. <b>Compiler pads</b> with zeros.</li></ul>
<table class="tbl"><tr><th>char</th><th>short</th><th>int</th><th>long</th><th>double</th><th>pointer</th></tr>
<tr><td>1</td><td>2</td><td>4</td><td>8</td><td>8</td><td>8</td></tr></table>
<pre class="code">struct { int id; char grade; int marks; }
id    @0  (4B)
grade @4  (1B)
pad   @5-7 (3B)
marks @8  (4B)     size = 12</pre>
<ul><li>Struct size is rounded up to the largest member alignment.</li>
<li><b>Reduce padding:</b> put larger members first. Excess padding → more memory, less efficient access.</li>
<li><b>Getting a member:</b> struct pointer in rdi, then <code>movl offset(%rdi), %eax</code>. Setting: <code>movl %esi, offset(%rdi)</code>.</li>
<li>Example: int id@0, char callsign[10]@4–13, pad 14–15, int x@16, y@20, life@24 → <code>24(%rdi)</code> is life; sizeof = 28.</li>
<li>Valid int addresses: divisible by 4 (100 ✓, 102 ✗).</li></ul>` }
],
t5: [
 { h: 'Three levels of parallelism', html: `
<table class="tbl"><tr><th>Level</th><th>Technique</th><th>Idea</th></tr>
<tr><td>Instruction (ILP)</td><td>Loop unrolling, pipelining, superscalar, OoO</td><td>independent instructions overlap in one core</td></tr>
<tr><td>Data (DLP)</td><td>SIMD (SSE2/AVX)</td><td>one instruction on many data elements</td></tr>
<tr><td>Thread (TLP)</td><td>pthreads</td><td>work split across cores/threads</td></tr></table>
<ul><li>Ideal speedup ≈ number of processing units. Real speedup is lower due to synchronisation/creation overheads (<b>Amdahl's law</b>).</li></ul>` },
 { h: 'Loop unrolling (ILP)', html: `
<ul><li>Dot product with 1 accumulator: loop overhead (i++, i&lt;n, jump) every element + <b>data-dependency chain</b> (sum depends on previous sum).</li>
<li>Unroll ×4 with <b>4 accumulators</b>: overhead once per 4 elements, <b>dependency chain broken</b> into 4 → more ILP exposed.</li>
<li><b>Cleanup loop</b> needed after: handles remaining elements when n is not a multiple of the unroll factor.</li>
<li>Expect: <b>higher IPC</b>, fewer branches, fewer cycles, shorter time vs scalar -O0. IPC 1.6 → 1.8 (slides). More chains: IPC rises then plateaus (4 and 8 both ≈ 2).</li>
<li>-O2 scalar had the best time but lower IPC than -O0 → compiler likely used SIMD/other tricks, not unrolling.</li>
<li>Long long used for sum because it overflows 32-bit int.</li></ul>` },
 { h: 'SIMD (DLP)', html: `
<ul><li><b>S</b>ingle <b>I</b>nstruction <b>M</b>ultiple <b>D</b>ata.</li>
<li>SSE2: 128-bit <b>XMM</b>, holds <b>four 32-bit ints</b>. AVX / AVX2: 256-bit (YMM). AVX-512: 512-bit (ZMM).</li>
<li><code>_mm_loadu_si128((__m128i*)&amp;a[i])</code> loads 16 bytes. Build with <code>-msse2</code>.</li>
<li>Loop does 4 elements/iteration → loop overhead per 4 elements. Need a <b>remainder loop</b> if n not a multiple of 4.</li>
<li>perf evidence: <b>fewer instructions and fewer cycles</b> than scalar (slides: −16% instr, −12% cycles, 0.21s → 0.18s).</li></ul>` },
 { h: 'Threads (TLP) & mutex', html: `
<ul><li>POSIX threads: <code>pthread_create</code> (make worker, give function + arg), <code>pthread_join</code> (<b>wait</b> for worker to finish). Build with <code>-pthread</code>.</li>
<li>Worker function takes <code>void*</code>, cast to real type. Struct can carry many args.</li>
<li>Threads also keep interactive apps responsive (e.g. game: render thread vs input/network thread).</li>
<li><b>Race condition:</b> <code>i++</code> is read-modify-write on shared data; two threads → result depends on order → non-deterministic.</li>
<li><b>Mutex:</b> <code>pthread_mutex_lock(&amp;m)</code> before, <code>pthread_mutex_unlock(&amp;m)</code> after. Forgetting unlock → <b>deadlock</b>. 2 threads × 10,000 increments with mutex = 20,000.</li>
<li>If each thread owns a <b>non-overlapping interval</b> → no mutex needed.</li>
<li>Threading overhead: creation, scheduling, synchronisation, context switching.</li></ul>` },
 { h: 'perf stat cheatsheet', html: `
<pre class="code">perf stat -r 20 -M insn_per_cycle,branch_miss_rate ./prog
perf stat -e cycles,instructions,branches,branch-misses ./sum</pre>
<table class="tbl"><tr><th>Stat</th><th>Meaning / what it proves</th></tr>
<tr><td>instructions, cycles</td><td>IPC = instructions ÷ cycles</td></tr>
<tr><td>IPC ↑</td><td>more ILP (unrolling)</td></tr>
<tr><td>branches, branch-misses</td><td>miss rate = misses ÷ branches</td></tr>
<tr><td>context-switches ↑↑</td><td>threading overhead</td></tr>
<tr><td>cpu-migrations</td><td>OS moved a thread between cores</td></tr>
<tr><td>task-clock</td><td>CPU time used; &gt; elapsed ⇒ multiple CPUs active</td></tr>
<tr><td>-r 20</td><td>repeat 20 runs → averages &amp; std dev</td></tr></table>
<div class="callout"><b>Fingerprints:</b> <b>Unrolled</b> → same-ish instructions, IPC ↑, branches ↓. <b>SIMD</b> → instructions ↓, cycles ↓, branches ↓. <b>Threaded</b> → context-switches &amp; cpu-migrations ↑↑, task-clock ≥ elapsed, IPC about same. <b>Shuffled input</b> → branch-miss rate ↑↑, IPC ↓, cycles ↑.<br>Threaded speedup = t<sub>single</sub> / t<sub>threaded</sub> (0.205/0.188 = 1.09).</div>` }
],
t6: [
 { h: 'The five stages', html: `
<table class="tbl"><tr><th>Stage</th><th>Does</th><th>Uses</th></tr>
<tr><td><b>F</b> Fetch</td><td>get instruction</td><td>instruction memory (I-cache)</td></tr>
<tr><td><b>D</b> Decode</td><td>decode, read regs</td><td>registers</td></tr>
<tr><td><b>E</b> Execute</td><td>compute</td><td>ALU</td></tr>
<tr><td><b>M</b> Memory</td><td>load/store</td><td>data memory (D-cache)</td></tr>
<tr><td><b>W</b> Write</td><td>write result back</td><td>registers</td></tr></table>
<p>Memory hierarchy (fast→slow): registers · L1i/L1d · L2 · L3 · RAM · SSD.</p>` },
 { h: 'Pipelining, speedup, latency', html: `
<ul><li><b>Throughput</b> = work per time. <b>IPC</b> = throughput in instructions per cycle.</li>
<li>No pipelining: each instruction takes 5 cycles → IPC = 1/5 = 0.2. With pipelining: IPC → <b>1</b> after pipeline fills (cycle 5).</li>
<li>k stages, N instructions: <b>T<sub>nopipe</sub> = N·k</b>, <b>T<sub>pipe</sub> = k + (N−1) = N + k − 1</b>.</li>
<li><b>Speedup = Nk / (N+k−1)</b> → tends to <b>k</b> as N → ∞. Max speedup = number of stages.</li>
<li>20 instructions, 5 stages → 20+5−1 = <b>24 cycles</b> (non-pipelined 100).</li>
<li><b>Latency</b> = time for ONE instruction to go through = k × stage time (5 × 2 ns = 10 ns). Pipelining improves <b>throughput, not latency</b>. Steady-state throughput = 1 instruction per 2 ns.</li>
<li>Deeper pipelines (&gt;30 stages) have diminishing returns; bigger misprediction penalty.</li></ul>` },
 { h: 'Data hazards', html: `
<ul><li><b>RAW</b> (read after write): <code>addq %rbx,%rax</code> then <code>subq %rax,%rcx</code>. Without forwarding subq stalls (F D – – E M W).</li>
<li><b>Forwarding:</b> addq's result exists at the end of its E → sent straight to subq's E. No stall.</li>
<li><b>Load-use:</b> <code>movq (%rax),%rbx</code> then <code>addq %rbx,%rcx</code>. Value only exists after <b>M</b>. Forwarding <b>cannot</b> fully remove it → 1 stall cycle.</li>
<li><b>Out-of-order execution</b> fills the gap with an independent instruction (e.g. <code>incq %r10</code>).</li>
<li>CPU tries, in order: <b>1. forwarding → 2. out-of-order scheduling → 3. stall</b>.</li>
<li>WAR, WAW: not an issue for in-order FDEMW (W stages occur in order). Matter when stages/instructions can finish out of order.</li>
<li>Loop unrolling breaks dependency chains → more ILP.</li></ul>
<pre class="code">no forwarding:   addq F D E M W
                 subq   F D - - E M W
with forwarding: addq F D E M W
                 subq   F D E M W
load-use:        movq F D E M W
                 addq   F D - E M W</pre>` },
 { h: 'Control hazards', html: `
<ul><li><code>cmpq; je lbl</code>: CPU doesn't yet know which instruction to fetch next.</li>
<li>Options: <b>predict</b> (very common) or <b>stall</b> (simple pipelines).</li>
<li><b>Misprediction:</b> wrongly fetched instructions are <b>flushed</b>, correct ones fetched. Penalty grows with pipeline depth (more in-flight instructions discarded).</li>
<li>Example: 100 branches, 95% correct. Stall 3 cycles each = 300 lost. Misprediction: 5 × 10 = 50 lost. Prediction wins only if accuracy is high.</li>
<li>Sorted input → predictable. Slides: sorted 0.1% miss, 0.42 s; shuffled 22.6% miss, 0.933 s (cycles more than double, instruction counts ≈ same).</li></ul>` },
 { h: 'Structural hazards & summary', html: `
<ul><li>Two instructions need the <b>same hardware in the same cycle</b>. Example: single memory unit needed by Fetch (instr 4) and Memory (instr 1) → instr 4 <b>stalls</b> one cycle.</li>
<li>Also: two <code>imulq</code> need the one multiplier.</li>
<li>Mitigation: <b>separate I-cache and D-cache</b>, more units.</li></ul>
<table class="tbl"><tr><th>Hazard</th><th>Problem</th><th>Fix</th></tr>
<tr><td>Data</td><td>value not available yet</td><td>forwarding, OoO</td></tr>
<tr><td>Control</td><td>don't know next instruction</td><td>branch prediction, predictable inputs</td></tr>
<tr><td>Structural</td><td>same hardware needed</td><td>additional hardware</td></tr></table>
<p>All three lower IPC (lost cycles). IPC &gt; 1 needs a superscalar CPU.</p>` }
],
t7: [
 { h: 'Scalar vs superscalar', html: `
<ul><li><b>Scalar</b>: issues at most 1 instruction/cycle → max IPC = 1 (e.g. ATmega328P).</li>
<li><b>N-issue superscalar</b>: issues (and retires) up to N per cycle → max IPC = N. Common widths 2, 4, 6, 8. All modern x86 are superscalar.</li>
<li>Actual IPC lower: dependencies, branches, cache misses, limited functional units.</li>
<li>How: multiple ALUs / <b>functional units</b> (adder, shifter, multiplier…), multiple load/store units, more register-file &amp; memory ports, <b>out-of-order</b> scheduling.</li>
<li>ALU redesign: a muxed ALU uses one block per cycle; a demuxed ALU of functional units can take several instructions' operands at once.</li>
<li>Two-issue datapath: 2 instructions fetched/cycle; per instruction: register file 3 address lines, 2 read, 1 write; data memory ports per instruction.</li>
<li>Superscalar enables <b>ILP</b> inside a single core. Performance depends on how much <b>independent work</b> exists.</li></ul>` },
 { h: 'Out-of-order pipeline steps', html: `
<ol><li>Fetch in <b>program order</b></li><li><b>Decode / rename</b> (architectural → physical registers)</li>
<li><b>Reservation stations</b> hold instructions waiting for operands</li><li>Select <b>ready</b> instructions regardless of program order</li>
<li><b>Execute</b> out of order</li><li><b>Reorder buffer (ROB)</b> stores completed results</li><li><b>Commit in order</b> → correctness kept</li></ol>` },
 { h: 'RAW / WAR / WAW & renaming', html: `
<ul><li><b>RAW (true dependency):</b> second needs value written by first → cannot issue together. Fix: break the chain (loop unrolling), forwarding. Renaming can't fix RAW.</li>
<li><b>WAR (false dependency):</b> I1: <code>RDX = RAX</code>; I2: <code>RAX = RCX + RAX</code>. If I2 runs before I1, I1 reads the <b>new</b> RAX instead of the old → wrong. Arises from too few architectural registers.</li>
<li><b>WAW:</b> two writes to the same register finish in wrong order.</li>
<li><b>Register renaming:</b> map architectural regs (rax…) to many hidden <b>physical registers</b> (P0, P1…). I1: RDX = RAX<sub>v1</sub>; I2: RAX<sub>v2</sub> = RCX + RAX<sub>v1</sub> → any order OK. Removes <b>WAR and WAW</b>, not RAW.</li></ul>
<table class="tbl"><tr><th>Architecture</th><th>RAW</th><th>WAR</th><th>WAW</th></tr>
<tr><td>In-order scalar</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>In-order superscalar</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Out-of-order superscalar</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr><td>OoO superscalar + renaming</td><td>Yes</td><td>No</td><td>No</td></tr></table>` },
 { h: 'Branches & unrolling on superscalar', html: `
<ul><li>A wide CPU needs a steady instruction supply. A misprediction wastes <b>many issue slots</b> → hurts more than on scalar. Accurate prediction is vital.</li>
<li>ROB still commits in program order.</li>
<li>Slides' unrolling experiment (1/2/4/8 chains): IPC rises with chains; 4 and 8 both ≈ 2 (no further gain); cycles ↓; branches ↓ (one branch per many iterations); elapsed time ↓.</li>
<li>Structural limit: many multiplies but one multiplier → structural hazard even on superscalar.</li></ul>` }
],
t8: [
 { h: 'Locality & cache geometry', html: `
<ul><li><b>Spatial locality:</b> nearby addresses accessed together (looping a[i]). <b>Temporal locality:</b> same address reused soon.</li>
<li>Cache = small fast memory near CPU. Purpose: reduce how often the CPU waits for slower memory.</li>
<li>Typical L1d: <b>32 kB = 32,768 B</b>, line = <b>64 B</b>, <b>8-way</b> set associative.</li>
<li>Lines = 32,768 / 64 = <b>512</b>. Sets = 512 / 8 = <b>64</b>. Each set holds 8 lines (ways).</li>
<li><code>lscpu --cache</code> shows sizes.</li></ul>` },
 { h: 'Address → block, set, tag, offset', html: `
<table class="tbl"><tr><th>Quantity</th><th>Formula (line 64 B, 64 sets)</th></tr>
<tr><td><b>Block number</b></td><td>address ÷ line size (integer division)</td></tr>
<tr><td><b>Set number</b></td><td>block % number of sets</td></tr>
<tr><td><b>Tag</b></td><td>block ÷ number of sets</td></tr>
<tr><td><b>Offset</b></td><td>address − line size × block (= address % 64)</td></tr>
<tr><td>Rebuild</td><td>block = tag × sets + set</td></tr></table>
<div class="callout"><b>Worked: address 1,000.</b> block = 1000/64 = 15 · set = 15 % 64 = 15 · tag = 15/64 = 0 · offset = 1000 − 960 = 40. Block 15 covers addresses 960…1,023.<br><b>Block 1111:</b> addresses 1111×64 = 71,104 … 71,167 (largest = 71,167). <b>Block 300:</b> set 300%64 = 44.</div>
<ul><li>Block = fixed-size chunk of RAM moved to cache; 1 block = 1 cache line (same size).</li>
<li>Set 2 receives blocks 2, 66, 130, 194 …</li>
<li><b>Hit:</b> a line in the set has the needed tag. <b>Miss:</b> tag absent → fetch from next level (L2).</li></ul>` },
 { h: 'Eviction policies', html: `
<table class="tbl"><tr><th>Policy</th><th>Evicts</th></tr>
<tr><td>LRU</td><td>line unused the longest</td></tr>
<tr><td>FIFO</td><td>oldest line in the set</td></tr>
<tr><td>LFU</td><td>least frequently accessed</td></tr>
<tr><td>Random</td><td>random line</td></tr></table>
<p>Set partially full → fill an empty line. Set full → evict one.</p>` },
 { h: 'Three kinds of miss', html: `
<ul><li><b>Compulsory (cold):</b> first time a block is fetched.</li>
<li><b>Capacity:</b> working set larger than cache. int a[100] = 400 B fits; a 4 MB matrix doesn't. Keep working set within cache.</li>
<li><b>Conflict:</b> cache has space overall but too many blocks map to the <b>same set</b> (&gt; 8 ways) and evict each other.</li></ul>` },
 { h: 'Matrix multiplication example', html: `
<ul><li>Basic algorithm is <b>O(n³)</b>. Square N×N. Row-major arrays.</li>
<li><b>ijk</b> reads b[k][j] down a column: stride = N×4 = 4,096 B (N=1024) → each 64 B line gives only 1 useful int (line holds 16 ints) → many misses. <b>ikj / kij</b> read b[k][j] along a row → adjacent, line fully used.</li>
<li>L1d miss rates: ijk 5.6%, ikj 0.4%, kij 0.7%. Instructions similar; cycles and time much higher for ijk.</li>
<li><b>Conflict misses:</b> N=1024 → row stride 4096 B = 64 blocks = a multiple of the 64 sets → every b[k][j] maps to the <b>same set</b> (8 ways). Set number increment per row: N=32 → +2, 64 → +4 … 1024 → +64 (≡ 0).</li>
<li><b>Working set:</b> a,b int + c long long = 16N² bytes. 16N² &lt; 32,768 → N &lt; 45 (really less).</li>
<li>N 512 → 1024: L1 misses 135 M → 1.09 B, IPC 1.9 → 0.7 (CPU waits for memory). Not due to branch misses (branch miss rate falls).</li>
<li><b>Tiling:</b> split into tiles (C00 = A00B00 + A01B10 …) so the working set fits the cache. Best tile = 8 in slides; too-small tiles → loop overhead outweighs gains.</li></ul>` },
 { h: 'Cache-friendly checklist', html: `
<ul><li>Loop in <b>row-major</b> order. Use ikj not ijk.</li><li>Keep working set ≤ cache (tiling).</li>
<li>Avoid strides that are a multiple of (sets × line size) → conflict misses.</li><li>Reuse data soon (temporal locality).</li>
<li>More RAM doesn't help if the program already has enough.</li></ul>` }
]
};

/* Flashcards: [topic, front, back] */
window.CARDS = [
 ['t1','GAS vs NASM: operand order?','GAS (AT&T): <code>mov src, dest</code>. NASM (Intel): <code>mov dest, src</code>.'],
 ['t1','GAS comment char / register prefix / immediate prefix?','<code>#</code> · <code>%rax</code> · <code>$60</code>. Memory = <code>(%rax)</code>.'],
 ['t1','Size suffixes b / w / l / q?','1 / 2 / 4 / 8 bytes. Suffix = destination size.'],
 ['t1','Does <code>movl $5,%eax</code> clear upper half of rax?','Yes — 32-bit writes zero-extend into the 64-bit register. 8/16-bit writes do not.'],
 ['t1','Is <code>movq (%rax),(%rbx)</code> legal?','No — memory-to-memory moves aren\'t supported.'],
 ['t1','xmm registers: count and width?','16 registers (xmm0–15), 128-bit each. Used for floats and SIMD.'],
 ['t1','Little endian: rbx after reading AA BB CC DD EE FF 01 02 (low→high addr)?','<code>0x0201FFEEDDCCBBAA</code> — lowest address = least significant byte.'],
 ['t1','gdb: examine 8 bytes / one 8-byte word / step instruction / step over call?','<code>x/8xb ADDR</code> · <code>x/gx ADDR</code> · <code>si</code> · <code>ni</code>'],
 ['t1','Linux syscall argument registers?','rax = number; rdi, rsi, rdx, r10, r8, r9 = args 1-6.'],
 ['t1','Syscall numbers 0 / 1 / 2 / 3 / 60?','read / write / open / close / exit.'],
 ['t1','write(fd, buf, n) register mapping?','rax=1, rdi=fd (1=stdout), rsi=buffer address, rdx=count. Returns bytes written.'],
 ['t1','Which register does syscall clobber?','rcx (and r11). rax holds return value.'],
 ['t1','printf: format string / first data arg / al?','rdi / rsi / number of xmm regs used (0 → <code>xorl %eax,%eax</code>).'],
 ['t1','Exit program sequence?','<code>movq $60,%rax; xorq %rdi,%rdi; syscall</code>'],
 ['t1','fd numbers?','0 stdin, 1 stdout, 2 stderr.'],
 ['t2','Effective address of D(Rb,Ri,S)?','D + Rb + Ri × S'],
 ['t2','Valid scale factors / forbidden index register?','1, 2, 4, 8 / rsp.'],
 ['t2','16(%rax,%rbx,8) with rax=100, rbx=5?','16 + 100 + 40 = 156.'],
 ['t2','What does lea do with memory?','Nothing — computes the address only (no dereference, no flags). Used for add/multiply.'],
 ['t2','leaq (%rax,%rax,4),%rdx, rax=7?','35 (rax × 5).'],
 ['t2','Integer arg registers in order?','rdi, rsi, rdx, rcx, r8, r9 (then stack, reverse order).'],
 ['t2','Float arg registers?','xmm0–xmm7.'],
 ['t2','Callee-saved registers?','rbx, rbp, r12, r13, r14, r15.'],
 ['t2','Caller-saved registers?','rax, rcx, rdx, rsi, rdi, r8–r11, xmm*.'],
 ['t2','Who saves caller-saved regs?','The caller, before the call (if needed after). Callee may overwrite them.'],
 ['t2','Who saves callee-saved regs?','The callee: push at entry, pop before ret.'],
 ['t2','Stack alignment rule?','rsp multiple of 16 immediately before <code>call</code>.'],
 ['t2','rsp alignment on function entry? Why?','8 off a 16-byte boundary (≡ 8 mod 16) — call pushed an 8-byte return address.'],
 ['t2','Test rsp alignment?','<code>testq $15,%rsp</code> → ZF=1 if divisible by 16.'],
 ['t2','Standard prologue / epilogue?','<code>pushq %rbp; movq %rsp,%rbp</code> … <code>leave; ret</code> (leave = movq %rbp,%rsp; popq %rbp)'],
 ['t2','After the prologue: 0(%rbp), 8(%rbp), 16(%rbp)?','saved rbp, return address, first stack-passed arg. Locals: negative offsets.'],
 ['t3','x &amp; 0xFF effect?','Keeps lowest byte (masking). 0xABCD &amp; 0xFF = 0xCD.'],
 ['t3','Force bits to 1 / toggle bits / clear bits?','OR with mask / XOR with mask / AND with inverted mask.'],
 ['t3','How to zero a register fast?','<code>xorq %r,%r</code>'],
 ['t3','x ^ 0xFF on a byte?','Flips every bit (= NOT).'],
 ['t3','x | 0x80 guarantees?','MSB (bit 7) = 1.'],
 ['t3','and vs test?','Both AND; <code>test</code> doesn\'t store result, only sets flags.'],
 ['t3','Result of notb on 00110011?','11001100 (0xCC). ~0xCC = 0x33.'],
 ['t3','sal k effect? sar k effect?','×2<sup>k</sup>, zeros in on right / ÷2<sup>k</sup> floor, sign bit copied in on left.'],
 ['t3','0110 sal 2 = ? −8 sar 2 = ?','11000 = 24 · 11111110 = −2.'],
 ['t3','cmpq opr1,opr2 computes?','opr2 − opr1 (result discarded, flags set). Read: "opr2 ___ opr1".'],
 ['t3','Signed vs unsigned jumps for a &lt; b, a &lt;= b, a &gt; b, a &gt;= b?','jl/jle/jg/jge · jb/jbe/ja/jae.'],
 ['t3','Letter meaning: G/L vs A/B?','Greater/Less = signed. Above/Below = unsigned.'],
 ['t3','seta / setbe / setl?','Unsigned &gt; / unsigned &lt;= / signed &lt;.'],
 ['t3','Destination of setX?','8-bit register or memory operand only (e.g. %al). Writes 0/1.'],
 ['t3','je vs jmp?','je is conditional on the compare result (ZF=1); jmp always jumps.'],
 ['t3','a &amp;&amp; b assembly shape?','test a; je false; test b; je false; result=1; jmp end; false: result=0 (short-circuit).'],
 ['t3','a || b assembly shape?','test a; jne true; test b; jne true; result=0; jmp end; true: result=1.'],
 ['t3','Why is ja wrong for signed ints?','It compares unsigned: −1 = 0xFF…FF counts as above everything.'],
 ['t4','Compile steps in order?','Preprocess → Compile → Assemble → Link.'],
 ['t4','Command to emit AT&amp;T asm at -O0?','<code>gcc -O0 -S -masm=att prog.c -o prog.s</code>'],
 ['t4','-O0 vs -O2?','-O0: debug, asm mirrors C. -O2: production, aggressive (inline, regs, dead code), no longer resembles C.'],
 ['t4','Why study -O0 output?','Close to C structure → learn C↔asm mapping; memory-aware coding.'],
 ['t4','Why not just trust the compiler?','Can\'t fix a bad algorithm; one-off static optimisation; doesn\'t know input patterns/cache behaviour.'],
 ['t4','cmovg a,b copies when?','Only if the previous cmp said signed greater-than.'],
 ['t4','Branch is better than cmov when?','Results are costly to compute and the branch is predictable.'],
 ['t4','cmov is better than branch when?','Both results are cheap and the condition is random/unpredictable.'],
 ['t4','Why can a compiler remove a loop at -O2?','The final result can be computed without executing iterations (e.g. sum 0..9 = 45).'],
 ['t4','2D row-major: k, i, j?','k = i·c + j; i = k / c; j = k % c.'],
 ['t4','a[1][2] in int a[2][3] flattened index?','1·3 + 2 = 5.'],
 ['t4','What must be passed to an asm function summing an array?','Array address AND the number of elements.'],
 ['t4','Struct member layout?','Sequential, declaration order; padded to alignment.'],
 ['t4','Alignment: char/short/int/long/double/ptr?','1 / 2 / 4 / 8 / 8 / 8.'],
 ['t4','Reduce struct padding how?','List larger members first.'],
 ['t4','int id; char g; int marks; offsets?','0, 4, 8 (3 bytes padding). Size 12.'],
 ['t5','Three levels of parallelism?','ILP (unrolling/pipelining/superscalar), DLP (SIMD), TLP (threads).'],
 ['t5','Why does unrolling help?','Less loop overhead per element + breaks dependency chain → more ILP, higher IPC.'],
 ['t5','Why a cleanup loop after unrolled/SIMD loop?','n may not be a multiple of the factor; process leftovers.'],
 ['t5','SIMD full name / SSE2 register?','Single Instruction Multiple Data / 128-bit XMM = 4 × 32-bit ints.'],
 ['t5','SIMD in perf?','Fewer instructions and fewer cycles than scalar.'],
 ['t5','pthread_create vs pthread_join?','create: start worker (function + arg). join: wait for worker to finish.'],
 ['t5','Why does i++ race?','Read-modify-write on shared data; interleaving gives lost updates.'],
 ['t5','Mutex rules?','Lock before updating shared data; unlock after (else deadlock). Not needed for non-overlapping data.'],
 ['t5','IPC formula?','instructions ÷ cycles.'],
 ['t5','perf proof of multiple cores active?','task-clock (CPU time) ≥ elapsed time.'],
 ['t5','perf stat fingerprints?','Unrolled: IPC↑. SIMD: instr↓ cycles↓. Threaded: ctx-switches↑ migrations↑.'],
 ['t5','Speedup formula?','t<sub>single</sub> / t<sub>parallel</sub>. Ideal ≈ #processing units (Amdahl limits).'],
 ['t6','Five stages and hardware?','F (I-cache) · D (registers) · E (ALU) · M (D-cache) · W (registers).'],
 ['t6','Pipelined cycles for N instr, k stages?','N + k − 1. Non-pipelined: N·k.'],
 ['t6','Max speedup of pipelining?','k (number of stages), as N → ∞.'],
 ['t6','Latency vs throughput?','Latency = one instruction\'s time through (k × stage time), unchanged. Throughput ↑ (IPC → 1).'],
 ['t6','IPC without / with pipelining?','1/5 = 0.2 / 1 once full.'],
 ['t6','RAW hazard?','Instruction needs a value a previous instruction hasn\'t written yet.'],
 ['t6','Why can forwarding not fix load-use?','Loaded value only available after the M stage.'],
 ['t6','Order CPU tries to fix data hazards?','Forwarding → out-of-order scheduling → stall.'],
 ['t6','Control hazard?','CPU doesn\'t know which instruction to fetch next (branch).'],
 ['t6','Misprediction penalty?','Flush wrongly fetched instructions, refetch. Deeper pipeline ⇒ bigger.'],
 ['t6','Structural hazard + fix?','Two instructions need same hardware. Fix: extra hardware e.g. separate I-cache and D-cache.'],
 ['t7','Max IPC scalar vs N-issue superscalar?','1 vs N.'],
 ['t7','Functional-unit examples?','Adder, shifter, logic, multiplier, load/store units.'],
 ['t7','OoO superscalar step order?','Fetch (in order) → decode/rename → reservation stations → select ready → execute OoO → ROB → commit in order.'],
 ['t7','WAR example?','I1: RDX=RAX; I2: RAX=RCX+RAX. I2 before I1 → I1 reads wrong RAX.'],
 ['t7','What does register renaming remove?','False dependencies WAR and WAW (not RAW).'],
 ['t7','Which hazards in OoO superscalar without renaming?','RAW, WAR and WAW all possible.'],
 ['t7','Why are mispredictions worse on superscalar?','Many issue slots wasted when wrong-path work is flushed.'],
 ['t7','What stops a superscalar reaching max IPC?','Dependencies, branches, cache misses, limited functional units.'],
 ['t8','L1d typical size / line / ways?','32 kB / 64 B / 8-way.'],
 ['t8','Lines and sets in L1d?','512 lines, 64 sets (512 / 8).'],
 ['t8','Block / set / tag / offset?','block = addr/64 · set = block % sets · tag = block / sets · offset = addr − 64·block.'],
 ['t8','Address 1000: block, set, tag, offset?','15, 15, 0, 40.'],
 ['t8','Which blocks map to set 2 (64 sets)?','2, 66, 130, 194, …'],
 ['t8','Cache hit vs miss?','Hit: needed tag found in the set. Miss: not found → fetch from next level.'],
 ['t8','Eviction policies?','LRU (longest unused), FIFO (oldest), LFU (least frequent), Random.'],
 ['t8','Three miss types?','Compulsory (first access), capacity (working set &gt; cache), conflict (too many blocks in same set).'],
 ['t8','Spatial vs temporal locality?','Nearby addresses together / same address again soon.'],
 ['t8','Why is ijk slower than ikj?','b[k][j] accessed with stride N·4 bytes → 1 useful int per 64 B line, more misses, conflicts.'],
 ['t8','N for working set 16N² to fit 32 kB?','N &lt; 45.'],
 ['t8','Purpose of tiling?','Shrink working set so tiles stay in cache → better locality. Tiny tiles → loop overhead dominates.'],
 ['t8','Block 1111 largest address (64 B lines)?','1112 × 64 − 1 = 71,167.']
];
