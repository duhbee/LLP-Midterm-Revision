/* Short-answer bank (2 marks each). s(topic, kind, question, modelAnswer, acceptList, ref)
   acceptList: normalised answers (lowercase, no spaces, no 0x, no %). Empty = self-mark only. */
window.SAQ = [];
(function () {
  let n = 0;
  function s(t, kind, text, model, accept, ref) {
    SAQ.push({ id: 's' + (++n), t, kind, text, model, accept: accept || [], ref: ref || '' });
  }
  const P = (c) => '<pre class="code">' + c + '</pre>';

  /* T1 */
  s('t1','a','After <code>movq $-1,%rax</code> then <code>movl $5,%eax</code>, give %rax in hex.',
    '0x5 — movl zero-extends into the upper 32 bits.',['5'],'W1 p6');
  s('t1','a','Memory bytes at addresses A…A+7 are 11 22 33 44 55 66 77 88. Give %rax in hex (no 0x) after <code>movq (A), %rax</code>.',
    '8877665544332211 — little endian: lowest address = least significant byte.',['8877665544332211'],'W1 p8');
  s('t1','a','%rax = 0x1122334455667788. Give %rax in hex after <code>movb $0x7F, %al</code>.',
    '0x112233445566777F — byte write changes only the low byte.',['112233445566777f'],'W1 p6');
  s('t1','c','State the register used for each argument of <code>write(fd, buf, n)</code> and the value of %rax for the call.',
    'rax = 1 (write), rdi = fd, rsi = buffer address, rdx = byte count.',[],'W1 p9');
  s('t1','c','Why must %al be set before calling printf, and to what value for integer/string-only arguments?',
    'printf is variadic: %al = number of xmm registers (float args) used. 0 for no floats, e.g. xorl %eax,%eax.',[],'W1 p13');
  s('t1','c','Give two differences between NASM and GAS syntax.',
    'Any two: Intel vs AT&T syntax; ; vs # comments; rax vs %rax; 60 vs $60; [rax] vs (%rax); mov dest,src vs movq src,dest; .asm vs .s.',[],'W1 p3');
  s('t1','c','Write the three instructions that exit a program with status 0.',
    'movq $60,%rax ; xorq %rdi,%rdi ; syscall',[],'W1 p9');
  s('t1','a','A single 8-byte read returns 0x0A6F6C6C6548. What ASCII string (in order of increasing address) does it hold?',
    '"Hello\\n" — 48 65 6C 6C 6F 0A, little endian.',['hello','hello\\n'],'W1 p10');

  /* T2 */
  s('t2','a','rax = 0x2000, rbx = 3. Give the address (hex, no 0x) of <code>0x10(%rax,%rbx,8)</code>.',
    '0x2000 + 3×8 + 0x10 = 0x2028.',['2028'],'W1 p17');
  s('t2','a','rdx = 0xF000. Give the address (hex, no 0x) of <code>0x80(,%rdx,2)</code>.',
    '2×0xF000 + 0x80 = 0x1E080.',['1e080'],'W1 p18');
  s('t2','a','rdi = 9. What value is in %rax after <code>leaq (%rdi,%rdi,2), %rax</code>?',
    '27 (9 + 9×2). lea does arithmetic only.',['27'],'W1 p19');
  s('t2','c','Why is %rsp 8 bytes off a 16-byte boundary on function entry?',
    'It was 16-aligned before the call; the call instruction pushed an 8-byte return address.',[],'W1 p24');
  s('t2','c','On entry rsp ≡ 8 (mod 16). A function does <code>pushq %rbx; pushq %rbp</code> then needs to call another function. Is rsp aligned? What fix?',
    'No — two pushes (16 bytes) leave rsp ≡ 8. Add subq $8,%rsp before the call (and addq after).',[],'W1 p24');
  s('t2','c','List the callee-saved registers and say who is responsible for preserving them.',
    'rbx, rbp, r12, r13, r14, r15 — the callee (push at entry, pop before ret).',[],'W1 p22');
  s('t2','c','After <code>pushq %rbp; movq %rsp,%rbp</code>, give the offsets (from %rbp) of the saved rbp, the return address, and a first local variable (4-byte).',
    '0(%rbp) saved rbp · 8(%rbp) return address · e.g. −4(%rbp) local (negative offsets).',[],'W1 p26');
  s('t2','c','What does the <code>leave</code> instruction do?',
    'movq %rbp,%rsp ; popq %rbp — tears down the frame (then ret).',[],'W1 p26');

  /* T3 */
  s('t3','a','Compute 0xB7 XOR 0x19. Give the answer in hex without 0x.',
    '1011 0111 ^ 0001 1001 = 1010 1110 = 0xAE.',['ae'],'W2 p7');
  s('t3','a','Compute 0xD6 AND 0x6C. Give the answer in hex without 0x.',
    '1101 0110 & 0110 1100 = 0100 0100 = 0x44.',['44'],'W2 p5');
  s('t3','a','Compute 0x42 OR 0x19. Give the answer in hex without 0x.',
    '0100 0010 | 0001 1001 = 0101 1011 = 0x5B.',['5b'],'W2 p6');
  s('t3','a','Give the 8-bit OR mask that sets bits 0 and 7 without changing other bits.',
    '10000001 (0x81).',['10000001','81'],'W2 p6');
  s('t3','a','Give the 8-bit AND mask that clears the low nibble of a byte and keeps the high nibble.',
    '11110000 (0xF0).',['11110000','f0'],'W2 p5');
  s('t3','a','What is the 8-bit result (binary) of arithmetic right shift by 2 of 11110000 (−16)?',
    '11111100 = −4 (sign bit copied in).',['11111100','-4'],'W2 p13');
  s('t3','a','13 is shifted left by 3 with <code>sal</code>. Give the decimal result.',
    '13 × 8 = 104.',['104'],'W2 p11');
  s('t3','a','After <code>movb $0x35,%al; xorb $0xFF,%al</code>, give %al in hex without 0x.',
    '0011 0101 flipped = 1100 1010 = 0xCA.',['ca'],'W2 p7');
  s('t3','a','Trace and give %r11 in hex (no 0x):'+P('movq $13, %r10\ncmpq $17, %r10\nje   lbl_eq\nmovq $0x123456, %r11\njmp  lbl_end\nlbl_eq:\nmovq $0xABCDEF, %r11\nlbl_end:'),
    'r10 (13) ≠ 17 so je is not taken → r11 = 0x123456.',['123456'],'W2 p15');
  s('t3','a','Trace and give %rax (decimal):'+P('movq $-7, %rsi\nmovq $5,  %rdi\ncmpq %rsi, %rdi\nja   lbl_true\nxorq %rax, %rax\njmp  lbl_end\nlbl_true:\nmovq $1, %rax\nlbl_end:'),
    'ja is unsigned: −7 = 0xFFFF…F9 is huge, so 5 is not above it → branch not taken → rax = 0.',['0'],'W2 p21');
  s('t3','a','Same program but <code>jg</code> instead of <code>ja</code>. Give %rax (decimal).',
    'jg is signed: 5 > −7 → taken → rax = 1.',['1'],'W2 p19');
  s('t3','c','Which flag does <code>sete %al</code> test, and what is stored if it is true?',
    'ZF (zero flag, set when the compared values are equal). Stores 1 in the byte, else 0. Destination must be 8-bit.',[],'W2 p10');
  s('t3','c','A programmer uses <code>jl</code> to compare two unsigned values. State the bug and the fix.',
    'jl is a signed comparison; use jb (below). e.g. −1 = 0xFF…F is the largest unsigned value.',[],'W2 p22');
  s('t3','c','Explain how <code>if (a &amp;&amp; b)</code> is implemented in assembly and why b may never be evaluated.',
    'test a; je false_label; test b; je false_label; result=1; jmp end; false: result=0. If a is 0 the first je skips b — short-circuit evaluation.',[],'W2 p16');
  s('t3','c','Give two differences between <code>and</code> and <code>test</code>.',
    'and stores the result in opr2; test discards it. Both set flags. test is used with je/jne to check zero/nonzero.',[],'W2 p5');

  /* T4 */
  s('t4','c','State when a conditional move (cmov) beats a branch, and when a branch beats cmov.',
    'cmov: both results cheap AND the condition is unpredictable (random). Branch: results costly and prediction mostly correct (only one path is computed).',[],'W3 p14');
  s('t4','a','For <code>int a[3][5]</code>, give the flattened index of a[2][3].',
    'k = i·c + j = 2×5 + 3 = 13.',['13'],'W3 p19');
  s('t4','a','In an array with 4 columns, flattened index k = 11 corresponds to which row and column?',
    'row = 11/4 = 2, column = 11 % 4 = 3.',['2,3','(2,3)','row2col3','a[2][3]'],'W3 p19');
  s('t4','a','Give sizeof for <code>struct { char c; double d; int i; }</code> on x86-64.',
    'c@0, pad 1–7, d@8, i@16, pad 17–23 (round to 8) → 24.',['24'],'W3 p25');
  s('t4','a','Reorder the members of the previous struct to minimise padding and give the new sizeof.',
    'double d; int i; char c; → d@0, i@8, c@12, pad 13–15 → 16 bytes. Larger members first.',['16'],'W3 p25');
  s('t4','a','A <code>struct { int id; int age; long marks; }</code> pointer is in %rdi. Write the instruction that loads marks into %rax.',
    'movq 8(%rdi), %rax (id@0, age@4, marks@8).',['movq8(rdi),rax','movq8(rdi),rax'],'W3 p22');
  s('t4','c','At -O2 the loop <code>for (i=0;i&lt;10;i++) sum+=i;</code> may disappear. Why?',
    'The compiler can compute the result (45) at compile time and just load it — result known without executing iterations.',[],'W3 p16');
  s('t4','c','Give two reasons to study low-level programming even though compilers optimise.',
    'Any two: compiler cannot fix a bad algorithm; static one-off optimisation that does not know inputs/access patterns; need to write cache-friendly code; debugging; understanding how computers work.',[],'W3 p7');
  s('t4','c','Why does an assembly function that sums an array need the element count as an argument?',
    'Assembly/array address carries no length; the loop needs a bound to know when to stop.',[],'W3 p18');
  s('t4','c','Give the gcc command to produce AT&amp;T assembly from prog.c with no optimisation.',
    'gcc -O0 -S -masm=att prog.c -o prog.s',['gcc-o0-s-masm=attprog.c-oprog.s'],'W3 p4');

  /* T5 */
  s('t5','c','Explain two benefits of unrolling a dot-product loop with four accumulators.',
    '1) Loop overhead (i++, compare, jump) is paid once per 4 elements. 2) The dependency chain on sum is broken into 4 independent chains → more ILP → higher IPC.',[],'W4 p6');
  s('t5','c','Why is a cleanup loop needed after a SIMD or unrolled main loop?',
    'n may not be a multiple of the factor (4); the leftover 1–3 elements must still be processed.',[],'W4 p6');
  s('t5','a','A SIMD loop processes 4 ints per iteration over n = 1003 ints. How many SIMD iterations, and how many leftover elements?',
    '250 iterations (1000 elements) and 3 leftover elements.',[],'W4 p14');
  s('t5','c','What is a race condition? Give the C code example and the standard fix.',
    'Two threads access a shared variable and the result depends on order — e.g. i++ (read-modify-write). Fix: protect with a mutex (lock before, unlock after).',[],'W4 p20');
  s('t5','c','What happens if a thread forgets to unlock a mutex?',
    'Deadlock — other threads wait indefinitely for a lock never released.',['deadlock'],'W4 p20');
  s('t5','a','A single-thread run takes 0.8 s and the threaded run 0.5 s. Give the speedup.',
    '0.8 / 0.5 = 1.6.',['1.6'],'W4 p25');
  s('t5','a','A run executes 3,000,000,000 instructions in 2,000,000,000 cycles. Give the IPC.',
    '3/2 = 1.5.',['1.5'],'W4 p8');
  s('t5','a','5,000,000 branch misses over 200,000,000 branches. Give the miss rate as a percentage.',
    '5/200 = 2.5%.',['2.5','2.5%'],'W4 p8');
  s('t5','c','Which perf statistics would show that a threaded program used multiple CPUs and paid thread overhead?',
    'task-clock > elapsed time (CPU time more than wall time), more cpu-migrations, many more context-switches.',[],'W4 p26');
  s('t5','c','Name the three levels of parallelism and one technique for each.',
    'Instruction-level: loop unrolling (pipelining/superscalar). Data-level: SIMD. Thread-level: pthreads.',[],'W4 p3');

  /* T6 */
  s('t6','a','How many cycles to execute 30 instructions on an ideal 5-stage pipeline?',
    'N + k − 1 = 30 + 5 − 1 = 34.',['34'],'W5 p6');
  s('t6','a','How many cycles for the same 30 instructions without pipelining?',
    'N × k = 30 × 5 = 150.',['150'],'W5 p6');
  s('t6','a','Speedup of a 5-stage pipeline for N = 10 instructions (give as a fraction or decimal).',
    '50 / 14 = 25/7 ≈ 3.57.',['3.57','25/7','50/14','3.6'],'W5 p6');
  s('t6','a','A 4-stage pipeline has 3 ns per stage. Give the instruction latency.',
    '4 × 3 ns = 12 ns.',['12ns','12'],'W5 p7');
  s('t6','a','Without forwarding, how many stall cycles does <code>subq %rax,%rcx</code> suffer after <code>addq %rbx,%rax</code>?',
    '2 stall cycles (F D – – E M W); with forwarding 0.',['2'],'W5 p10');
  s('t6','c','Why can forwarding not remove all stalls for <code>movq (%rax),%rbx</code> followed by <code>addq %rbx,%rcx</code>?',
    'The loaded value is only available after the M stage, too late to forward into the next E. One stall remains (out-of-order scheduling can fill it).',[],'W5 p10');
  s('t6','a','200 branches are 90% predicted correctly; each misprediction costs 12 cycles. How many cycles are lost?',
    '20 mispredictions × 12 = 240.',['240'],'W5 p15');
  s('t6','a','A simple pipeline instead stalls 4 cycles on every one of those 200 branches. How many cycles are lost, and which is better?',
    '200 × 4 = 800 lost; prediction (240) is better.',['800'],'W5 p15');
  s('t6','c','Explain why pipelining improves throughput but not latency.',
    'Several instructions overlap in different stages so one completes every cycle (IPC → 1), but each still passes through all k stages, taking k × stage time.',[],'W5 p7');
  s('t6','c','Give one example of a structural hazard and one hardware fix.',
    'Fetch and Memory stages needing one memory unit (or two imulq needing one multiplier). Fix: separate I-cache and D-cache / more units.',[],'W5 p19');
  s('t6','c','Name the three hazard types and one mitigation for each.',
    'Data → forwarding/out-of-order. Control → branch prediction (predictable inputs). Structural → extra hardware (separate I/D caches).',[],'W5 p21');

  /* T7 */
  s('t7','a','What is the maximum IPC of a 4-issue superscalar CPU, and of a scalar pipelined CPU?',
    '4 and 1.',[],'W5s p5');
  s('t7','c','Why can a RAW dependency not be removed by register renaming?',
    'It is a true dependency: the consumer genuinely needs the producer\'s result. Renaming removes only false dependencies (WAR, WAW).',[],'W5s p11');
  s('t7','c','I1: RDX = RAX; I2: RAX = RCX + RAX. Explain the WAR hazard and show the renamed instructions.',
    'If I2 runs first it overwrites RAX before I1 reads the old value. Renamed: I1: RDX = RAXv1 ; I2: RAXv2 = RCX + RAXv1 (v1/v2 are different physical registers).',[],'W5s p10-11');
  s('t7','c','What is the role of the reorder buffer (ROB)?',
    'Holds completed results of out-of-order execution and commits them in program order, preserving correctness.',[],'W5s p4');
  s('t7','c','Why are branch mispredictions worse on a superscalar CPU than a scalar one?',
    'It issues several instructions per cycle, so many issue slots/in-flight instructions are wasted and flushed when wrong.',[],'W5s p12');
  s('t7','c','Give two reasons a superscalar CPU\'s actual IPC is below its issue width.',
    'Any two: data dependencies (RAW), branches/mispredictions, cache misses, limited functional units (structural hazards).',[],'W5s p5');
  s('t7','c','Give three hardware features that allow IPC &gt; 1.',
    'Multiple ALUs/functional units, multiple load/store units, more register/memory ports, out-of-order execution (with renaming).',[],'W5 p23');

  /* T8 */
  s('t8','a','For address 2000 with 64-byte lines and 64 sets, give block, set, tag and offset.',
    'block = 2000/64 = 31; set = 31 % 64 = 31; tag = 31/64 = 0; offset = 2000 − 31×64 = 16.',[],'W6 p7');
  s('t8','a','For address 10000 (64 B lines, 64 sets), give block, set, tag and offset.',
    'block = 156 (156×64 = 9984); set = 156 % 64 = 28; tag = 156/64 = 2; offset = 16.',[],'W6 p7');
  s('t8','a','Block 200 in a cache with 64 sets: give set number and tag.',
    'set = 200 % 64 = 8; tag = 200/64 = 3.',[],'W6 p7');
  s('t8','a','A 64 kB cache has 64 B lines and 8 ways. How many lines and how many sets?',
    'Lines = 65,536/64 = 1,024; sets = 1,024/8 = 128.',[],'W6 p5');
  s('t8','a','Which set do blocks 3, 67, 131 and 195 map to (64 sets)?',
    'Set 3 (all ≡ 3 mod 64).',['3','set3'],'W6 p6');
  s('t8','a','Working set = 16N² bytes. Find the largest integer N so it fits a 32,768-byte cache (state the bound).',
    '16N² < 32,768 → N² < 2,048 → N < 45.3, so N ≤ 45 (in practice less, other data also needs cache).',[],'W6 p22');
  s('t8','c','Define compulsory, capacity and conflict misses.',
    'Compulsory: first access to a block. Capacity: working set larger than cache. Conflict: enough space overall but too many blocks map to the same set.',[],'W6 p12');
  s('t8','c','Explain why ikj is more cache-friendly than ijk for matrix multiplication.',
    'ijk reads b[k][j] down a column with a stride of N×4 bytes → each 64 B line gives one useful int and lines are evicted. ikj reads b along a row (adjacent addresses) → full line use, spatial locality.',[],'W6 p20');
  s('t8','c','Why do rows of stride 4096 bytes cause conflict misses in a 64-set, 64 B-line cache?',
    '4096 B = 64 blocks = a multiple of the number of sets, so every row maps to the same set, which has only 8 ways.',[],'W6 p21');
  s('t8','c','Why can very small tile sizes reduce performance?',
    'More loop overhead which outweighs the cache gains.',[],'W6 p26');
  s('t8','c','Name two eviction policies and say what each evicts.',
    'LRU: line unused longest; FIFO: oldest line; LFU: least frequently used; Random.',[],'W6 p10');
  s('t8','c','Define spatial and temporal locality.',
    'Spatial: nearby addresses tend to be accessed together. Temporal: the same address tends to be accessed again soon.',[],'W6 p5');
})();
