/* MCQ bank. q(topic, set, kind, text, correct, [wrong...], explanation, ref)
   set: 'past' = reproduced/reworded from the course quizzes, 'new' = new practice
   kind: 'a' = arithmetic / tracing, 'c' = conceptual */
window.MCQ = [];
(function () {
  let n = 0;
  function q(t, set, kind, text, ans, wrong, exp, ref) {
    MCQ.push({ id: 'm' + (++n), t, set, kind, text, ans, wrong, exp, ref });
  }
  const NONE = 'None of the options';

  /* ============ T1: GNU assembly basics ============ */
  q('t1','past','c','Which statement about copying a 32-bit value into a 64-bit register with <code>movl</code> is correct?',
    'Writing to %eax with movl automatically zero-extends the upper 32 bits of %rax',
    ['movl sign-extends into the upper 32 bits of %rax','movl preserves the previous upper 32 bits of %rax','movl changes only condition flags, not the destination','movq must always be used to modify %rax'],
    '32-bit register writes zero-extend into the 64-bit register. 8- and 16-bit writes leave the other bytes alone.','W1 p6');
  q('t1','past','c','Which instruction stores a 64-bit immediate value into %rax?',
    'movq $0x123456789ABCDEF0, %rax',
    ['movl $0x123456789ABCDEF0, %eax','movw $0xDEF0, %ax','movb $0xF0, %al','movq %rax, $0x123456789ABCDEF0'],
    'Only the q suffix with %rax holds 64 bits. The last option has src/dest reversed (cannot store into an immediate).','W1 p6');
  q('t1','past','c','Memory at (%rdi) holds 8 bytes. Which instruction loads all 8 bytes into %rax?',
    'movq (%rdi), %rax',['movl (%rdi), %eax','movw (%rdi), %ax','movb (%rdi), %al','movq %rax, (%rdi)'],
    'q = 8 bytes. The last option stores instead of loads.','W1 p8');
  q('t1','past','c','Which instruction copies the lower 16 bits of %rdx into the lower 16 bits of %rcx?',
    'movw %dx, %cx',['movw %cx, %dx','movb %dl, %cl','movl %edx, %ecx','movq %rdx, %rcx'],
    'w = 16 bits and AT&T order is src, dest.','W1 p6');
  q('t1','past','c','Which instruction copies the low 8 bits of %rax into memory at (%rbx)?',
    'movb %al, (%rbx)',['movb (%rbx), %al','movq %rax, (%rbx)','movl %eax, (%rbx)','movw %ax, (%rbx)'],
    'b = 1 byte; %al is the low byte; src first.','W1 p6');
  q('t1','past','c','Which instruction is invalid because the operand sizes do not match?',
    'movb %al, %bx',['movb %al, %bl','movw %ax, %bx','movq %rax, %rbx','movl %eax, %ebx'],
    '%al is 8-bit but %bx is 16-bit.','W1 p6');
  q('t1','past','c','Which mistake is most likely to produce wrong output when printing a floating-point value with printf from assembly?',
    'Passing the value in a general-purpose register instead of %xmm0',
    ['Using .asciz for the format string','Calling printf through the PLT','Linking against libc','Using %rdi for the format string'],
    'Float arguments go in xmm0..xmm7 and %al must hold the number of xmm registers used.','W1 p14');
  q('t1','past','c','Under the System V ABI, which register holds the address of the format string before calling printf?',
    '%rdi',['%rsi','%rdx','%rcx','%rax'],'rdi = first argument = format string.','W1 p13');
  q('t1','past','c','For <code>printf("%s", str)</code>, which register holds the address of str?',
    '%rsi',['%rdi','%rdx','%rax','%rcx'],'rdi has the format; the first data argument is in rsi.','W1 p13');
  q('t1','past','c','For <code>printf("%d", x)</code>, which register typically holds x?',
    '%rsi',['%rdi','%rdx','%r8','%rax'],'First data argument → rsi.','W1 p13');
  q('t1','past','c','Before calling printf with only integer and string arguments, what value is commonly placed in %rax (%al)?',
    '0',['1','2','The address of the format string','The number of characters expected'],
    '%al = number of xmm registers used = number of float args = 0.','W1 p13');
  q('t1','past','c','What does the return value of the write system call represent on success?',
    'Number of bytes written',['System call number','Address of the buffer','File descriptor used','Process ID'],
    'write returns the byte count in rax.','W1 p9');
  q('t1','past','c','For the write system call, which register holds the address of the buffer?',
    '%rsi',['%rdi','%rdx','%rax','%r8'],'rdi=fd, rsi=buffer, rdx=count.','W1 p9');
  q('t1','past','c','Which register is overwritten by the <code>syscall</code> instruction and cannot be relied upon afterwards without saving?',
    '%rcx',['%rsi','%rdi','%r8','%r12'],'syscall clobbers rcx (return address) and r11.','W1 p9');
  q('t1','past','c','Which sequence correctly prepares <code>write(1, msg, 13)</code> before <code>syscall</code>?',
    '%rax=1  %rdi=1  %rsi=msg  %rdx=13',
    ['%rax=1  %rdi=msg  %rsi=1  %rdx=13','%rax=60  %rdi=1  %rsi=msg  %rdx=13','%rax=1  %rdi=13  %rsi=msg  %rdx=1','%rax=13  %rdi=1  %rsi=msg  %rdx=1'],
    'rax = call number (1 = write); then fd, buffer, count in rdi, rsi, rdx.','W1 p9');
  q('t1','past','c','In Linux x86-64, which system call is invoked when %rax = 1 before <code>syscall</code>?',
    'write',['read','open','close','exit'],'0 read, 1 write, 2 open, 3 close, 60 exit.','W1 p9');
  q('t1','new','c','Which is the AT&amp;T (GAS) form of "copy rdi into rax"?',
    'movq %rdi, %rax',['mov rax, rdi','movq %rax, %rdi','movq rdi, rax'],'AT&T: src first, % on registers, size suffix.','W1 p3');
  q('t1','new','c','Which comment character does the GNU assembler use?',
    '#',[';','//','--'],'NASM uses ; and GAS uses #.','W1 p3');
  q('t1','new','a','After <code>movq $-1, %rax</code> then <code>movl $5, %eax</code>, what is %rax?',
    '0x5',['0xFFFFFFFF00000005','0xFFFFFFFFFFFFFFFF','0x00000000FFFFFFFF'],
    'movl to %eax zero-extends into rax, so the upper 32 bits become 0.','W1 p6');
  q('t1','new','a','After <code>movq $-1, %rax</code> then <code>movb $5, %al</code>, what is %rax?',
    '0xFFFFFFFFFFFFFF05',['0x5','0xFFFFFFFF00000005','0x0000000000000005'],
    '8-bit writes only change the low byte; no zero-extension.','W1 p6');
  q('t1','new','a','Memory bytes from low to high address are AA BB CC DD EE FF 01 02. After <code>movq (%rax), %rbx</code>, %rbx is:',
    '0x0201FFEEDDCCBBAA',['0xAABBCCDDEEFF0102','0x02FF01EEDDCCBBAA','0xAABBCCDD'],
    'Little endian: byte at the lowest address becomes the least significant byte.','W1 p8');
  q('t1','new','c','Which syscall number terminates the program?',
    '60',['0','1','3'],'exit = 60 (rdi = status).','W1 p9');
  q('t1','new','c','Which file descriptor number is standard error?',
    '2',['0','1','3'],'0 stdin, 1 stdout, 2 stderr.','W1 p9');
  q('t1','new','c','How many bytes does a 128-bit xmm register hold?',
    '16',['8','4','32'],'xmm0–xmm15 are 128-bit = 16 bytes.','W1 p5');
  q('t1','new','c','Why does the syscall convention use %r10 for argument 4, not %rcx?',
    'syscall itself overwrites rcx',['rcx is callee-saved','rcx is reserved for rsp','r10 is faster'],
    'The syscall instruction stores the return address in rcx.','W1 p9');
  q('t1','new','c','Which gdb command prints one 8-byte word at the address in rax in hex?',
    'x/gx $rax',['x/1xb $rax','x/wd $rax','si $rax'],'g = giant (8 bytes), x = hex.','W1 p8');
  q('t1','new','c','Why is <code>movq (%rax), (%rbx)</code> rejected by the assembler?',
    'x86-64 does not allow memory-to-memory mov',['rax is not a base register','q cannot be used with memory','rbx is callee-saved'],
    'At least one operand must be a register (or the source an immediate).','W1 p6');

  /* ============ T2: Addressing, ABI & stack ============ */
  q('t2','past','c','What alignment must the stack pointer have immediately before a <code>call</code> executes (System V x86-64)?',
    '16-byte aligned',['8-byte aligned','32-byte aligned','No requirement','Aligned to the largest local variable'],
    'rsp must be a multiple of 16 just before call.','W1 p22,24');
  q('t2','past','c','On entry to a function, what is the typical alignment of %rsp relative to 16 bytes?',
    '8 bytes off a 16-byte boundary',['Exactly 16-byte aligned','32-byte aligned','4-byte aligned','Unspecified'],
    'The call pushed an 8-byte return address after rsp was aligned.','W1 p24');
  q('t2','past','c','Why does a function often <code>subq $8,%rsp</code> (or push one register) before calling another function?',
    'The call that entered it pushed an 8-byte return address, leaving rsp 8 off alignment',
    ['To align %rbp','To reserve space for register arguments','To save %rax automatically','The callee requires a local variable'],
    'Entry rsp ≡ 8 (mod 16); subtracting 8 restores a multiple of 16.','W1 p24');
  q('t2','past','a','A function allocates 40 bytes of locals after entry (rsp ≡ 8 mod 16). What extra adjustment is needed before calling another function?',
    'None — 40 is ≡ 8 (mod 16), so rsp is already aligned',
    ['Allocate 8 more bytes','Allocate 16 more bytes','Push three registers','Free all locals first'],
    'Entry rsp ≡ 8 (mod 16). Subtracting 40 (≡ 8 mod 16) gives rsp ≡ 0 → already a multiple of 16.','W1 p24');
  q('t2','past','c','A function pushes one callee-saved register and then wants to call another function. What must it usually do before the call?',
    'Check/adjust %rsp so the stack is 16-byte aligned',['Pop the register immediately','Use syscall instead of call','Move the register into %rax','Clear the stack frame'],
    'Pushing 8 bytes changes alignment; recheck before every call. (Entry ≡ 8, one push → ≡ 0, already OK; two pushes → misaligned.)','W1 p24');
  q('t2','past','c','Which group contains only callee-saved registers?',
    '%rbx %rbp %r12 %r13 %r14 %r15',['%rax %rbx %rcx %rdx','%rdi %rsi %rbp %rax','%r8 %r9 %r10 %r11 %rax','%rax %rcx %rdx %rsi %rdi'],
    'Callee-saved: rbx, rbp, r12–r15.','W1 p22');
  q('t2','past','c','Which sequence correctly preserves callee-saved %rbx?',
    'Push %rbx on entry and pop %rbx before ret',['Move %rbx to %rax only','Clear %rbx before ret','Store %rbx in %rdi and leave it','Use syscall before ret'],
    'Callee saves at start, restores before return.','W1 p22');
  q('t2','past','c','A caller needs the value in %r10 after a function call. What should it do?',
    'Save %r10 before making the call',['Assume the callee preserves it','Move it to %r15 after the call','Use ret instead of call','Place it on the heap permanently'],
    'r10 is caller-saved: the callee may clobber it.','W1 p22');
  q('t2','past','c','A function modifies %r12 and wants to preserve the caller\'s value. What must it do?',
    'Save %r12 on entry and restore it before return',['Nothing, r12 is caller-saved','Clear %r12 before return','Store %r12 in %rdi permanently','Move %r12 into %rax only'],
    'r12 is callee-saved.','W1 p22');
  q('t2','past','c','Which register is caller-saved?',
    '%r10',['%r13','%r15','%rbp','%rbx'],'Caller-saved: rax rcx rdx rsi rdi r8–r11.','W1 p22');
  q('t2','past','c','In <code>movl (%rbx,%rcx,4), %edx</code> what does the scale factor 4 typically represent?',
    'The size of each array element in bytes',['The displacement','The number of registers','The destination size','The instruction length'],
    'Index × element size = byte offset.','W1 p17');
  q('t2','past','a','If %rax = 100 and %rbx = 5, what address does <code>16(%rax,%rbx,8)</code> compute?',
    '156',['816','121','105','140'],'16 + 100 + 5×8 = 156.','W1 p17');
  q('t2','past','c','In <code>8(%rax,%rbx,4)</code> which component is the scale factor?',
    '4',['8','%rax','%rbx'],'D(Rb, Ri, S): D=8, Rb=rax, Ri=rbx, S=4.','W1 p17');
  q('t2','past','c','Why is a scale factor of 8 commonly used for an array of 64-bit integers?',
    'Each element occupies 8 bytes',['Registers are 8 bytes','The CPU is 64-bit','Addresses are hexadecimal','It reduces cache misses automatically'],
    'Scale = element size.','W1 p17');
  q('t2','past','c','Which scale factors are valid in x86-64 scaled index addressing?',
    '1, 2, 4 and 8',['1, 2, 3 and 4','2, 4, 6 and 8','1, 4, 8 and 16','Only 1 and 2'],'Only 1/2/4/8.','W1 p17');
  q('t2','past','c','Which statement best describes <code>leaq</code>?',
    'It computes an address without reading memory contents',['It always loads 8 bytes from memory','It stores a value into memory','It clears the destination register','It modifies the addressed memory location'],
    'lea = load effective address; no dereference.','W1 p19');
  q('t2','past','a','What is placed in %rdx after <code>leaq (%rax,%rax,4), %rdx</code> when %rax = 7?',
    '35',['28','49','14','7'],'7 + 7×4 = 35.','W1 p19');
  q('t2','past','c','Which instruction computes an effective address and stores a 64-bit result in %rax?',
    'leaq 8(%rbx,%rcx,4), %rax',['movq 8(%rbx,%rcx,4), %rax','leal 8(%rbx,%rcx,4), %eax','addq %rbx, %rax','leaw 8(%bx,%si), %ax'],
    'leaq = 64-bit destination, no memory access.','W1 p19');
  q('t2','past','c','Which instruction stores a 16-bit effective-address result into %cx?',
    'leaw 6(%bx,%si), %cx',['leal 6(%ebx,%esi), %ecx','leaq 6(%rbx,%rsi), %rcx','movw 6(%bx,%si), %cx','addw %si, %cx'],
    'w suffix → 16-bit destination.','W1 p19');
  q('t2','past','c','Which instruction computes rdi + rsi×8 into %rax without dereferencing memory?',
    'leaq (%rdi,%rsi,8), %rax',['movq (%rdi,%rsi,8), %rax','pushq (%rdi,%rsi,8)','leal (%edi,%esi,8), %eax','addq %rsi, %rdi'],
    'lea with scale 8.','W1 p19');
  q('t2','past','a','Given <code>leaq 24(%rdi,%rsi,4), %rax</code>, what is placed in %rax?',
    '%rdi + 4×%rsi + 24, without dereferencing memory',['The 64-bit value stored at %rdi + 4×%rsi + 24','%rdi + %rsi + 24 after dereferencing','%rdi + 24 only','4 × the value at address %rsi, plus %rdi + 24'],
    'lea returns the address itself.','W1 p19');
  q('t2','past','c','Which register is callee-saved and must be preserved by a called function that uses it?',
    '%rbx',['%rax','%rdi','%r10','%r11'],'rbx is callee-saved; the others are caller-saved.','W1 p22');
  q('t2','past','c','What is the primary purpose of <code>movq %rsp, %rbp</code> in a typical prologue?',
    'Establish a stable frame pointer for accessing stack data',['Align the stack to 16 bytes','Save the return address','Allocate local variables','Pass arguments'],
    'rsp moves with push/call; rbp stays put.','W1 p26');
  q('t2','past','c','Which sequence restores the caller\'s frame pointer before returning?',
    '<code>leave</code> followed by <code>ret</code>',['ret followed by leave','pushq %rbp followed by ret','movq %rbp,%rax followed by ret','popq %rax followed by ret'],
    'leave = movq %rbp,%rsp; popq %rbp.','W1 p26');
  q('t2','past','c','After <code>pushq %rbp; movq %rsp,%rbp</code>, where is the caller\'s saved %rbp relative to the new frame pointer?',
    '0(%rbp)',['-8(%rbp)','8(%rbp)','16(%rbp)','-16(%rbp)'],'rbp points at the saved rbp; return address is at 8(%rbp).','W1 p26');
  q('t2','past','c','With a frame pointer, how are stack-passed arguments (beyond the register arguments) typically referenced?',
    'Using positive offsets from %rbp',['Using negative offsets from %rbp','Using %rax as base','Using only the instruction pointer'],
    'Locals are negative, incoming stack args positive (16(%rbp) onward).','W1 p26');
  q('t2','past','c','Why can %rbp simplify debugging and stack unwinding?',
    'It provides a consistent reference point for stack-frame traversal',['It holds return values','It eliminates the need for a stack','It prevents stack overflow','It stores locals automatically'],
    'Frame pointers chain the frames.','W1 p26');
  q('t2','new','a','rdx = 0xF000 and rcx = 0x100. What is the address of <code>(%rdx,%rcx,4)</code>?',
    '0xF400',['0xF100','0xF004','0x1F000'],'0xF000 + 4×0x100 = 0xF400.','W1 p18');
  q('t2','new','a','rdx = 0xF000. What is the address of <code>0x80(,%rdx,2)</code>?',
    '0x1E080',['0xF080','0x1E000','0xF100'],'2×0xF000 = 0x1E000; + 0x80 = 0x1E080.','W1 p18');
  q('t2','new','c','Which register can NOT be used as the index register of scaled addressing?',
    '%rsp',['%rbp','%rax','%r15'],'rsp cannot be an index.','W1 p17');
  q('t2','new','a','Entry to a function has rsp = 0x7FFFFFF8. After <code>pushq %rbx</code> and <code>subq $16,%rsp</code>, what is rsp, and is it aligned for a call?',
    '0x7FFFFFE0 — aligned',['0x7FFFFFE8 — aligned','0x7FFFFFE0 — not aligned','0x7FFFFFF0 — not aligned'],
    '0x7FFFFFF8 − 8 = 0x7FFFFFF0; − 0x10 = 0x7FFFFFE0, a multiple of 16.','W1 p24');
  q('t2','new','c','Which are the first three integer argument registers in the System V ABI?',
    '%rdi, %rsi, %rdx',['%rax, %rbx, %rcx','%rdi, %rdx, %rsi','%rcx, %rdx, %r8'],'rdi, rsi, rdx, rcx, r8, r9.','W1 p22');
  q('t2','new','c','Which instruction tests whether rsp is a multiple of 16?',
    'testq $15, %rsp',['testq $16, %rsp','cmpq $16, %rsp','andq $15, %rsp'],'Low four bits zero ⇔ divisible by 16; test does not modify rsp (andq would).','W1 p25');
  q('t2','new','c','Which registers carry the first eight floating-point arguments?',
    '%xmm0–%xmm7',['%rdi–%r9','%xmm8–%xmm15','%st0–%st7'],'Floats use xmm0–xmm7.','W1 p22');
  q('t2','new','c','In a function with <code>pushq %rbp; movq %rsp,%rbp</code>, where is the first local variable stored?',
    'At a negative offset such as -4(%rbp)',['At 8(%rbp)','At 16(%rbp)','At 0(%rbp)'],'Stack grows down; locals sit below rbp.','W1 p26');

  /* ============ T3: Bits, shifts & jumps ============ */
  q('t3','past','a','A register holds 0x42. What is it after OR with mask 0x19?',
    '0x5B',['0x4B','0x41','0xD9','0x59'],'0100 0010 | 0001 1001 = 0101 1011.','W2 p6');
  q('t3','past','c','<code>cmp</code> is followed by <code>je label_equal</code>. If the branch is NOT taken, what can be concluded?',
    'The compared values were not equal',['The program reached label_equal','The compared values were equal','The operands were unsigned',NONE],
    'je jumps only when ZF = 1 (equal).','W2 p15');
  q('t3','past','a','An 8-bit value has exactly three 1 bits. How many 1 bits after a bitwise NOT?',
    'Five',['One','Three','Eight','Zero'],'NOT flips every bit: 8 − 3 = 5.','W2 p8');
  q('t3','past','a','Which mask toggles bits 1 and 6 of an 8-bit value with one XOR?',
    '01000010',['01000001','01000110','11000010','10111101'],'Bit 6 → 0100 0000; bit 1 → 0000 0010.','W2 p7');
  q('t3','past','a','Which mask forces bits 1 and 6 to 1 with one OR?',
    '01000010',['01000001','01000110','11000010','10111101'],'OR with 1 sets the bit.','W2 p6');
  q('t3','past','a','A flag register holds 10010001. Which OR mask forces bits 2 and 5 to 1 and leaves the rest alone?',
    '00100100',['00010100','00100110','01000100','00100010'],'Bit 2 = 0000 0100, bit 5 = 0010 0000.','W2 p6');
  q('t3','past','c','Which restriction applies to the destination of <code>sete</code> and <code>setne</code>?',
    'It must be an 8-bit register or memory operand',['It must be a 64-bit register','It must be a floating-point register','It must be an immediate',NONE],
    'set writes a single byte 0/1.','W2 p9');
  q('t3','past','a','A signed 8-bit value 11111000 is shifted right arithmetically by 2. Result?',
    '11111110',['01111110','00111110','00011110',NONE],'sar copies the sign bit: −8 / 4 = −2.','W2 p13');
  q('t3','past','a','0x3C XOR 0xA5 = ?',
    '0x99',['0xC9','0xE1','0xB9',NONE],'0011 1100 ^ 1010 0101 = 1001 1001.','W2 p7');
  q('t3','past','a','0xB7 XOR 0x19 = ?',
    '0xAE',['0x9E','0xB8','0xCE',NONE],'1011 0111 ^ 0001 1001 = 1010 1110.','W2 p7');
  q('t3','past','c','A value is ORed with mask 0x80. What is guaranteed?',
    'Its most significant bit is 1',['All bits become 1','Its most significant bit is 0','Only its low byte is kept','Its least significant bit is 1'],'0x80 = 1000 0000.','W2 p6');
  q('t3','past','c','Which pair represents the UNSIGNED greater-than and less-than jumps?',
    'ja and jb',['jg and jl','jle and jbe','je and jne',NONE],'Above/Below = unsigned.','W2 p22');
  q('t3','past','c','When <code>sal</code> shifts a value left, what is inserted on the right?',
    'Zeros',['Copies of the sign bit','Original least significant bits','Alternating zeros and ones',NONE],'Zeros fill on the right; the leftmost bit is discarded.','W2 p11');
  q('t3','past','c','For signed operands, which jump branches when a ≤ b?',
    'jle',['jl','jbe','jne',NONE],'jle = jump if less or equal (signed).','W2 p22');
  q('t3','past','a','An 8-bit value is XORed with 0xFF. What happens to each bit?',
    'Every bit is flipped',['Every bit is cleared','Every bit is set to 1','Only the MSB flips',NONE],'x ^ 1 = ~x.','W2 p7');
  q('t3','past','a','Two permission bytes are 11011010 and 01101110. Which bits are enabled in both?',
    '01001010',['00010010','11011010','10010010','01101110'],'Bitwise AND.','W2 p5');
  q('t3','past','a','0xD6 AND 0x6C = ?',
    '0x44',['0x64','0x46','0xCC',NONE],'1101 0110 & 0110 1100 = 0100 0100.','W2 p5');
  q('t3','past','a','%al contains 00110011. After <code>notb %al</code>, %al = ?',
    '11001100',['00001111','10101010','11110000','00110011'],'Flip every bit.','W2 p8');
  q('t3','past','a','An 8-bit register holds 0xCC. After a bitwise NOT it holds:',
    '0x33',['0x00','0xC3','0xCC',NONE],'~1100 1100 = 0011 0011.','W2 p8');
  q('t3','past','a','0x5A AND 0xF3 = ?',
    '0x52',['0x53','0x50','0x72',NONE],'0101 1010 & 1111 0011 = 0101 0010.','W2 p5');
  q('t3','past','a','The 64-bit value 0x123456789ABCDEFF is masked with AND 0xFF. Result?',
    '0x00000000000000FF',['0x000000009ABCDEFF','0x00000000000012FF','0x12345678000000FF','0x000000000000DEFF'],'Only the lowest byte (0xFF) survives.','W2 p5');
  q('t3','past','a','00000110 is arithmetically shifted left by 2. Result?',
    '00011000',['00001100','00000001','01100000','00010110'],'6 × 4 = 24 = 0001 1000.','W2 p11');
  q('t3','past','a','A value 0110b is shifted left twice with <code>sal</code>. Decimal result?',
    '24',['12','6','48','18'],'6 × 2² = 24.','W2 p11');
  q('t3','past','c','Which statement correctly distinguishes <code>je</code> from <code>jmp</code>?',
    'je depends on a comparison result whereas jmp does not',['jmp depends on a comparison result whereas je does not','Both require the zero flag','Both always transfer control','Neither can target a label'],'jmp is unconditional.','W2 p15');
  q('t3','past','c','After <code>cmpq opr1, opr2</code>, which UNSIGNED jump tests opr2 &gt; opr1?',
    'ja',['jg','jle','jl','je'],'ja = unsigned above.','W2 p21');
  q('t3','past','c','A programmer compares two unsigned integers but uses <code>jl</code> instead of <code>jb</code>. What is the issue?',
    'jl performs a signed comparison',['jl only tests equality','jl is identical to jb','jl ignores the comparison result','jl always jumps'],'Use jb/ja/jae/jbe for unsigned.','W2 p22');
  q('t3','past','c','A programmer uses <code>ja</code> instead of <code>jg</code> to compare signed integers. What is the issue?',
    'ja performs an unsigned comparison',['ja only tests equality','ja is identical to jg','ja ignores the comparison','ja always jumps'],'Use jg/jl/jge/jle for signed.','W2 p22');
  q('t3','past','c','Which signed jump branches when a &gt; b?',
    'jg',['jl','ja','jne',NONE],'Greater = signed.','W2 p22');
  q('t3','past','c','Which <code>set</code> instruction matches signed <code>a &lt; b</code>?',
    'setl',['setb','setg','sete',NONE],'Less = signed; below = unsigned.','W2 p10');
  q('t3','past','c','Which set instruction matches the unsigned expression <code>a &lt;= b</code>?',
    'setbe',['setle','setb','setg',NONE],'below-or-equal.','W2 p10');
  q('t3','past','c','Which set instruction matches <code>a == b</code> regardless of signedness?',
    'sete',['setl','setg','setne','seta'],'Equality ignores sign.','W2 p10');
  q('t3','past','c','Which UNSIGNED jump branches when two values are equal or the left is greater?',
    'jae',['jbe','ja','jb','jne'],'above-or-equal.','W2 p22');
  q('t3','past','c','Which SIGNED jump branches when two values are equal or the left is greater?',
    'jge',['jg','jle','jl','jne'],'greater-or-equal.','W2 p22');
  q('t3','past','c','To build a bit mask by moving bits toward more significant positions, use:',
    'sal',['sar','setne','not',NONE],'Shift left.','W2 p11');
  q('t3','past','c','After a <code>cmp</code>, which jump transfers control only when the compared values are equal?',
    'je',['jne','jg','jmp','ja'],'ZF = 1.','W2 p15');
  q('t3','past','c','Which assembly concept most directly enables repeated execution of a block of instructions?',
    'A branch targeting an earlier instruction address',['A stack allocation','A structure member access','A bitwise XOR'],'Loops use backward jumps.','W3 p16');
  q('t3','new','c','<code>testq %rdi, %rdi</code> followed by <code>je L</code>. When is L taken?',
    'When rdi = 0',['When rdi &gt; 0','When rdi &lt; 0','When rdi = 1'],'test ANDs a value with itself: ZF=1 iff zero.','W2 p16');
  q('t3','new','c','What is the difference between <code>and</code> and <code>test</code>?',
    'test does not store its result, only sets flags',['and does not set flags','test works only on bytes','and is logical, test is bitwise'],'','W2 p5');
  q('t3','new','a','rsi = 5, rdi = 6. After <code>cmpq %rsi,%rdi</code> then <code>jb L1</code>, is L1 taken?',
    'No — 6 &lt; 5 is false (rdi vs rsi)',['Yes — 5 &lt; 6','Yes — jb is always taken','Depends on sign only'],'cmp computes opr2 − opr1, read as "rdi jb rsi".','W2 p21');
  q('t3','new','a','rsi = −7, rdi = 5. After <code>cmpq %rsi,%rdi</code> then <code>jg L</code>, is L taken?',
    'Yes — 5 &gt; −7 signed',['No — −7 is larger','No — jg is unsigned','Only if OF is set'],'','W2 p19');
  q('t3','new','a','rsi = −7, rdi = 5. Same cmp, now <code>ja L</code>. Is L taken?',
    'No — as unsigned, −7 is a huge number (0xFF…F9), so 5 is below it',['Yes — 5 &gt; −7','Yes — ja ignores sign','Depends on ZF only'],
    'ja treats both as unsigned. This is why signed data needs jg.','W2 p21');
  q('t3','new','a','−8 (1111 1000) <code>sar 1</code> then <code>sar 1</code> again. Final 8-bit result?',
    '1111 1110 (−2)',['0011 1110','1111 1100 (−4)','0000 0010'],'−8 → −4 → −2.','W2 p13');
  q('t3','new','a','0110 shifted right by 2 with <code>sar</code> gives:',
    '0001',['0011','1001','0000'],'6 ÷ 4 = 1 (fraction discarded).','W2 p12');
  q('t3','new','a','x = 0xABCD. What does <code>x &amp; 0xFF</code> give?',
    '0xCD',['0xAB','0xAB00','0xFF'],'Keeps the lowest byte.','W2 p5');
  q('t3','new','c','Which C expression compiles to test + jump (short-circuit) rather than a single and/or instruction?',
    'if (a &amp;&amp; b)',['x = a &amp; b','x = a | b','x = a ^ b'],'Logical operators short-circuit.','W2 p16');
  q('t3','new','c','In the assembly for <code>a || b</code> (short-circuit), which conditional jump is used after testing a?',
    'jne to the "true" label',['je to the "false" label','jl','ja'],'If a is non-zero the result is true immediately.','W2 p17');
  q('t3','new','a','1001 XOR 1100 = ?',
    '0101',['1101','1000','0110'],'Bits 2 and 3 toggled.','W2 p7');
  q('t3','new','a','<code>movb $0b00110011,%al</code> then <code>notb %al</code>. What is %al in hex?',
    '0xCC',['0x33','0xFF','0x0C'],'Flip 0011 0011 → 1100 1100.','W2 p8');
  q('t3','new','c','Which instruction sets %al to 1 if the previous compare found "not equal"?',
    'setne %al',['sete %al','jne %al','cmovne %al'],'','W2 p9');
  q('t3','new','c','x ^ x equals:',
    '0',['x','1','0xFF'],'Used to zero registers: xorq %rax,%rax.','W2 p7');

  /* ============ T4: C to assembly ============ */
  q('t4','past','c','When is a conditional BRANCH generally more efficient than a conditional move?',
    'When the results are costly to compute and the branch is usually predicted correctly',
    ['When both results are cheap and predictions are random','When both paths must always execute','When memory alignment is poor','When no condition exists'],
    'A branch computes only one path; cmov computes both.','W3 p14');
  q('t4','past','c','Which conditional move matches the signed C expression <code>a &gt; b</code>?',
    'cmovg',['cmova','cmovl','cmovne','cmovbe'],'','W3 p14');
  q('t4','past','c','Which conditional move matches the unsigned expression <code>a &gt;= b</code>?',
    'cmovae',['cmovge','cmova','cmovbe','cmove'],'','W3 p14');
  q('t4','past','c','Which conditional move matches a != b for signed and unsigned values?',
    'cmovne',['cmove','cmovl','cmovge','cmovbe'],'','W3 p14');
  q('t4','past','c','Which conditional move matches the signed expression a &lt; b?',
    'cmovl',['cmovb','cmovg','cmovge','cmove'],'','W3 p14');
  q('t4','past','c','In max(a,b) where both values are already in registers, which technique selects the larger without a jump?',
    'Conditional move',['Arithmetic shift','Bitwise NOT','Function call','Unconditional move'],'','W3 p13');
  q('t4','past','c','Which situation most strongly favours a conditional move over branching?',
    'The condition is hard to predict and both candidate results are cheap',['The predictor is almost always correct','Only one result is cheap','The computation needs a loop'],'','W3 p14');
  q('t4','past','c','Which characteristic makes cmov attractive for choosing between two already-computed values?',
    'Both candidate results are already available',['Only one result must be computed','The comparison can be skipped','The destination must be memory'],'','W3 p14');
  q('t4','past','a','For <code>int a[2][3]</code> (2 rows, 3 columns), what is the flattened index of a[1][2]?',
    '5',['2','3','1',NONE],'k = i·c + j = 1·3 + 2.','W3 p19');
  q('t4','past','c','For a 2D array with c columns, which formula converts row i and column j to the flattened index k?',
    'k = i*c + j',['k = i*j','k = i + j','k = i*c - j','k = i + j*c*c'],'','W3 p19');
  q('t4','past','c','For a 2D array with c columns, which expression recovers the column index from flattened index k?',
    'k % c',['k / c','k − c','k * c','c / k'],'row = k / c.','W3 p19');
  q('t4','past','c','Why can a compiler sometimes eliminate an entire loop?',
    'The final result can be determined without executing the iterations',['Loops cannot be represented in assembly','The processor forbids repeated branches','Array accesses are impossible to analyse'],'','W3 p16');
  q('t4','past','c','In a struct with only fixed-size members, how are the members typically arranged in memory?',
    'Sequentially in the order declared',['Sorted largest to smallest','In separate regions','Arranged by runtime values'],'','W3 p22');
  q('t4','past','c','What is a common consequence of excessive padding in structures?',
    'Increased memory use and potentially less efficient memory access',['Faster execution always','Elimination of cache misses','Automatic vectorisation'],'','W3 p25');
  q('t4','past','c','Which ordering of struct members generally reduces padding?',
    'Larger members before smaller members',['Smaller before larger','Alphabetical','By initial value'],'','W3 p25');
  q('t4','past','a','If an int needs 4-byte alignment, which address is correctly aligned?',
    '100',['102','106','110'],'100 ÷ 4 = 25.','W3 p24');
  q('t4','past','c','Traversing a 1D array of unsigned integers in assembly, what must be passed with the array address?',
    'The number of elements',['The stack frame size','The program entry address','The processor cache size'],'','W3 p18');
  q('t4','past','c','What is the primary benefit of accessing array elements sequentially?',
    'Improved spatial locality and cache friendliness',['Automatic loop unrolling','Guaranteed vectorisation','Elimination of all branches'],'','W3 p20');
  q('t4','past','c','What is the main purpose of the comparison near the end of many loops?',
    'To determine whether another iteration should execute',['To initialise the counter','To move data between registers','To reorder instructions'],'','W3 p16');
  q('t4','past','c','Why are branch mispredictions relatively low in simple counting loops?',
    'The branch outcome follows a predictable pattern',['The comparison is skipped','Conditional moves replace all branches','The loop runs once'],'','W3 p16');
  q('t4','new','c','Which command emits AT&amp;T assembly with no optimisation?',
    'gcc -O0 -S -masm=att prog.c -o prog.s',['gcc -O2 -c prog.c','gcc -S -masm=intel -O3 prog.c','gcc -g prog.c'],'','W3 p4');
  q('t4','new','c','Put the stages in order: assemble, link, preprocess, compile.',
    'preprocess → compile → assemble → link',['compile → preprocess → assemble → link','preprocess → assemble → compile → link','link → compile → assemble → preprocess'],'','W3 p3');
  q('t4','new','c','Which optimisation level is the usual default for debugging?',
    '-O0',['-O2','-O3','-Os'],'','W3 p5');
  q('t4','new','c','Why can -O3 generate larger code than -O0?',
    'Unrolling, inlining and vectorisation prioritise speed over size',['It adds debug symbols','It disables registers','It adds padding to every function'],'','W3 p5');
  q('t4','new','c','At -O2, <code>x + y</code> returned from a function may become:',
    'leal (%rdi,%rsi), %eax',['pushq %rdi','call add','movq %rdi, -4(%rbp)'],'','W3 p11');
  q('t4','new','a','struct { int id; char grade; int marks; }. At what offset is marks?',
    '8',['5','4','9'],'id 0–3, grade 4, padding 5–7, marks 8.','W3 p25');
  q('t4','new','a','struct { char a; int b; char c; } — sizeof?',
    '12',['6','9','8'],'a@0, pad 1–3, b@4, c@8, pad 9–11 → 12.','W3 p25');
  q('t4','new','a','struct { int b; char a; char c; } — sizeof?',
    '8',['6','12','9'],'b@0, a@4, c@5, pad 6–7 → 8. Reordering saves 4 bytes.','W3 p25');
  q('t4','new','a','A pointer to a struct is in %rdi. The member <code>int life</code> is at offset 24. Which instruction loads it into %eax?',
    'movl 24(%rdi), %eax',['movl (%rdi,24), %eax','leal 24(%rdi), %eax','movq %rdi, 24(%eax)'],'','W3 p22');
  q('t4','new','a','In a 3-row × 4-column int array, the element at flattened index k = 9 is at:',
    'a[2][1]',['a[1][2]','a[3][0]','a[2][2]'],'row = 9/4 = 2, col = 9%4 = 1.','W3 p19');
  q('t4','new','c','Which scaled-index operand reads <code>int a[i]</code> when base is rsi and i is in rcx?',
    '(%rsi,%rcx,4)',['(%rsi,%rcx,1)','(%rcx,%rsi,8)','4(%rsi,%rcx)'],'','W3 p18');
  q('t4','new','c','Why does a 2D-sum loop with one counter running 0 … r·c−1 perform well?',
    'It walks contiguous memory (row-major) — good spatial locality',['It avoids all branches','It uses SIMD automatically','It removes padding'],'','W3 p20');
  q('t4','new','c','A branch is taken 1,000 times in a row. What is likely?',
    'The branch predictor will predict it correctly',['Misprediction penalty will be high','A cmov is required','The loop will be unrolled'],'','W3 p14');

  /* ============ T5: Parallelism & perf ============ */
  q('t5','past','c','What is the primary goal of loop unrolling?',
    'Reduce loop overhead by performing more work per iteration',['Reduce memory capacity requirements','Increase the number of function calls','Convert integers to floating point','Eliminate all arithmetic'],'','W4 p6');
  q('t5','past','c','Why is extra code often required after the main unrolled loop?',
    'To process remaining elements when the count is not a multiple of the unroll factor',['To undo the loop computations','To allocate memory','To convert integers to pointers'],'','W4 p6');
  q('t5','past','c','Why is extra code often needed after the main SIMD loop?',
    'To process remaining elements when the array size is not a multiple of the SIMD width',['To allocate SIMD registers','To initialise the arrays','To recompute all vector operations'],'','W4 p14');
  q('t5','past','c','What does SIMD stand for?',
    'Single Instruction Multiple Data',['Single Input Multiple Device','Sequential Instruction Multiple Data','Single Instruction Managed Data'],'','W4 p11');
  q('t5','past','c','Which perf observation supports the effectiveness of SIMD for vector addition?',
    'Fewer instructions and fewer CPU cycles for the same workload',['More instructions and more cycles','Higher context-switch counts','More CPU migrations','Higher branch counts only'],'','W4 p16');
  q('t5','past','c','Which perf statistic helps show that multiple CPU cores were active in a threaded program?',
    'task-clock',['branch-misses','cache-references','instructions per cycle','L1 cache loads'],'','W4 p26');
  q('t5','past','a','A 128-bit SSE2 XMM register holds how many 32-bit integers?',
    '4',['2','8','16','32'],'128 / 32 = 4.','W4 p12');
  q('t5','past','c','Which pthread function creates a new worker thread?',
    'pthread_create',['pthread_wait','pthread_exit','pthread_mutex_lock',NONE],'','W4 p19');
  q('t5','past','c','What is the purpose of <code>pthread_join</code> after creating a worker?',
    'To wait for the worker thread to complete',['To unlock a mutex','To create another worker','To allocate stack memory','To move the thread to another CPU'],'','W4 p19');
  q('t5','past','c','Why can <code>i++</code> cause a race condition across threads?',
    'It is a read-modify-write sequence on shared data',['It requires SIMD instructions','It always generates a branch miss','It cannot be compiled by GCC'],'','W4 p20');
  q('t5','past','c','Which perf metric best demonstrates improved ILP from loop unrolling?',
    'Instructions per cycle (IPC)',['Context switches','CPU migrations','Cache miss rate','Task clock'],'','W4 p8');
  q('t5','past','c','The formula for instructions per cycle (IPC) is:',
    'instructions divided by cycles',['cycles divided by instructions','branches divided by cycles','branch-misses divided by branches'],'','W4 p8');
  q('t5','past','c','Which perf command measures only cycles, instructions, branches and branch misses of <code>./sum</code>?',
    'perf stat -e cycles,instructions,branches,branch-misses ./sum',['perf record ./sum','perf stat -O2 ./sum','gcc -O2 sum.c -o sum','perf stat -e cache-misses ./sum'],'','W4 p8');
  q('t5','past','c','What is the primary purpose of <code>perf</code> in Linux?',
    'To measure and analyse program performance using hardware performance counters',['To compile C programs with optimisation','To translate assembly to machine code','To replace the scheduler'],'','W4 p8');
  q('t5','past','c','Which perf statistic shows how many instructions the CPU executed?',
    'instructions',['cycles','branches','cache-misses','branch-misses'],'','W4 p8');
  q('t5','past','c','An unrolled loop processes four elements per iteration instead of one. Effect on loop-control instructions?',
    'Their frequency is reduced relative to useful work',['They execute only after the loop','Their frequency increases fourfold','They are eliminated','They become memory operations'],'','W4 p6');
  q('t5','past','c','Scalar function vs a second version (perf). Run 1 scalar: 134.2 M branches, 2.47 B instr, IPC 1.6, 0.612 s, 19 ctx-switches. Run 2: 59.3 M branches, 1.24 B instr, IPC 1.3, 0.381 s, 14 ctx-switches, 0 migrations. Which technique was applied?',
    'SIMD',['Unrolled','Threaded','None'],
    'Instructions and branches roughly halve while time drops: one instruction processes several elements. Unrolling would raise IPC; threading would raise context-switches/migrations.','W4 p16');
  q('t5','past','c','Run 1 scalar: 134.2 M branches, 2.47 B instr, IPC 1.6, 0.614 s. Run 2: 58.8 M branches, 2.41 B instr, IPC 2.1, 0.465 s, 12 ctx-switches. Which technique?',
    'Unrolled',['SIMD','Threaded','None'],
    'Instruction count about the same but IPC up (2.1) and branches down — unrolling.','W4 p15');
  q('t5','past','c','Run 1 scalar: 0.614 s, 20 ctx-switches, 0 migrations, IPC 1.6. Run 2: 1,105 ctx-switches, 256 cpu-migrations, task-clock 798 ms, IPC 1.5, 0.517 s. Which technique?',
    'Threaded',['SIMD','Unrolled','None'],
    'Huge context-switches and migrations point at threads. IPC stays about the same.','W4 p25');
  q('t5','past','c','A software engineer shuffles his input to different degrees (Run 1: branch-miss 0.1%, IPC 1.4; Run 2: 20.5%, IPC 0.7, 0.944 s; Run 3: 11.7%, IPC 0.9; Run 4: 17.5%; Run 5: 19.9%). Which run was MOST shuffled?',
    'Run 2',['Run 1','Run 3','Run 4','Run 5'],'Highest branch-miss rate and lowest IPC / slowest time → most random.','W5 p17');
  q('t5','past','c','Four runs with different ILP: Run 1 IPC 2.0 (0.26 s), Run 2 IPC 1.5 (0.42 s), Run 3 IPC 1.6, Run 4 IPC 2.0. Which has the WORST ILP?',
    'Run 2',['Run 1','Run 3','Run 4'],'Lowest IPC = worst ILP.','W4 p8');
  q('t5','new','c','Why is <code>long long</code> used for the dot-product sum of int arrays?',
    'The sum is expected to overflow a 32-bit int',['int is slower','long long is aligned better','It enables SIMD'],'','W4 p6');
  q('t5','new','c','Which SIMD extension uses 256-bit YMM registers?',
    'AVX / AVX2',['SSE2','AVX-512','MMX'],'SSE2 128 · AVX 256 · AVX-512 512.','W4 p12');
  q('t5','new','c','What is a deadlock in the mutex example?',
    'A thread waits indefinitely because the lock is never released',['Two threads write at once','The stack overflows','The mutex is freed twice'],'','W4 p20');
  q('t5','new','c','When is a mutex NOT needed in the threaded vector addition?',
    'When each thread works on non-overlapping index ranges',['When using more than 4 threads','When the arrays are int','When compiled at -O0'],'','W4 p23');
  q('t5','new','a','Two threads each do <code>counter++</code> 10,000 times with correct mutex locking. Final counter?',
    '20,000',['10,000','Random','0'],'','W4 p20');
  q('t5','new','a','Scalar run 0.205 s, threaded 0.188 s. Speedup ≈ ?',
    '1.09',['0.92','2.0','0.188'],'0.205/0.188 = 1.09.','W4 p25');
  q('t5','new','c','Threaded program: elapsed 0.181 s, task-clock 0.213 s. What does task-clock &gt; elapsed show?',
    'More than one CPU was working at the same time',['The program is single threaded','Branch mispredictions','Cache hits'],'','W4 p26');
  q('t5','new','c','Which flag is added to gcc when building with pthreads?',
    '-pthread',['-msse2','-O3','-lm'],'','W4 p19');
  q('t5','new','c','Which flag is added when compiling SSE2 intrinsics?',
    '-msse2',['-pthread','-O0','-g'],'','W4 p15');
  q('t5','new','c','Threading does not raise IPC much because:',
    'IPC measures ILP within one core, threading exploits TLP across cores',['threads disable pipelining','threads share one ALU','IPC counts cache misses'],'','W4 p25');
  q('t5','new','c','Why is scalar -O2 often faster than hand unrolling at -O0?',
    'The compiler likely applies unrolling, SIMD and other optimisations itself',['-O2 adds more threads','-O2 removes the CPU pipeline','-O0 disables arrays'],'','W4 p27');

  /* ============ T6: Pipelining ============ */
  q('t6','past','a','A five-stage pipeline executes 20 instructions, 1 cycle per stage, no hazards. How many cycles?',
    '24',['20','21','25','100'],'N + k − 1 = 20 + 5 − 1.','W5 p6');
  q('t6','past','a','5-stage pipeline, each stage 2 ns. Latency and steady-state throughput?',
    'Latency 10 ns, throughput one instruction every 2 ns',['Latency 5 ns, one every 2 ns','Latency 10 ns, one every 10 ns','Latency 2 ns, one every 10 ns','Latency 2 ns, one every 2 ns'],'','W5 p7');
  q('t6','past','c','A pipeline has one memory unit for fetch and data access. Instruction 1 is in M while instruction 4 is ready to F. What happens?',
    'Instruction 4 stalls until the memory unit is free',['Both access it simultaneously','Instruction 1 is flushed','Instruction 4 skips fetch','Instruction 1 restarts from decode'],'Structural hazard.','W5 p19');
  q('t6','past','c','For a k-stage pipeline, what is the maximum theoretical speedup as N becomes very large?',
    'k',['N','N/k','k−1','kN'],'Nk / (N+k−1) → k.','W5 p6');
  q('t6','past','c','Which hardware addition directly reduces the memory-access structural hazard between Fetch and Memory?',
    'Separate instruction and data caches',['Branch prediction','Register renaming','Loop unrolling','A larger register file'],'','W5 p19');
  q('t6','past','c','What happens after a branch misprediction?',
    'Incorrectly fetched instructions are flushed and the correct ones fetched',['The CPU stalls permanently','The branch is ignored','Registers are cleared','Clock speed is reduced'],'','W5 p15');
  q('t6','past','a','Instruction latency in a 5-stage pipeline where each stage takes 2 ns?',
    '10 ns',['2 ns','5 ns','1 ns','20 ns'],'','W5 p7');
  q('t6','past','c','Which pipeline stage writes results back to registers?',
    'W',['F','D','E','M'],'','W5 p4');
  q('t6','past','c','A RAW hazard occurs when an instruction:',
    'Needs a value that a previous instruction has not yet written',['Writes a value before reading it','Competes for hardware','Is mispredicted','Executes out of order'],'','W5 p10');
  q('t6','past','c','Why does a deeper pipeline generally increase misprediction penalty?',
    'More in-flight instructions may need to be discarded',['Branches occur more often','Loads always miss','Forwarding becomes impossible','IPC is fixed at 0.2'],'','W5 p15');
  q('t6','past','c','Why can forwarding not fully remove a load-use dependency?',
    'The loaded value is not available until the Memory stage',['Loads bypass memory','The ALU cannot process loaded values','Registers cannot be written after loads','Fetch blocks forwarding'],'','W5 p10');
  q('t6','past','c','What defines a control hazard?',
    'The CPU does not yet know which instruction stream to fetch next',['Two instructions need the same ALU','A value has not been written yet','The cache is full','An instruction needs multiple registers'],'','W5 p14');
  q('t6','past','c','In a 5-stage FDEMW pipeline, why does pipelining improve performance?',
    'It increases throughput by letting multiple instructions occupy different stages at once',['It makes each stage faster','It reduces the instruction count','It eliminates hazards','It reduces program size'],'','W5 p5');
  q('t6','past','a','In the simplified 5-stage pipeline, after the pipeline fills with no hazards, what is the IPC?',
    '1',['5','0.2','0','Depends on instruction'],'','W5 p5');
  q('t6','past','c','Which type of hazard most directly reduces available instruction-level parallelism?',
    'Data hazard',['Cache hit','Function call','Instruction fetch','Register allocation'],'','W5 p22');
  q('t6','past','c','A sorted array gives branch miss rate 0.1%, a shuffled one 22.6%, instruction counts nearly equal. What does this show?',
    'Predictable branches reduce lost cycles and time',['Sorting adds instructions','Branches do not matter','Shuffling raises IPC'],'','W5 p17');
  q('t6','new','a','6 stages, 100 instructions. Pipelined cycles?',
    '105',['100','600','106'],'N + k − 1 = 100 + 5 = 105.','W5 p6');
  q('t6','new','a','Speedup of a 5-stage pipeline for N = 20 vs no pipeline (Nk/(N+k−1))?',
    '100/24 ≈ 4.17',['5','20/5 = 4','24/100'],'','W5 p6');
  q('t6','new','a','Non-pipelined: each instruction takes 5 cycles. IPC?',
    '0.2',['1','5','0.5'],'','W5 p5');
  q('t6','new','c','Which pair shows a load-use dependency?',
    'movq (%rax),%rbx then addq %rbx,%rcx',['addq %rbx,%rax then subq %rax,%rcx','incq %r10 then incq %r11','movq %rax,%rbx then movq %rcx,%rdx'],'','W5 p10');
  q('t6','new','c','In the load-use case, how many stall cycles remain after forwarding?',
    '1',['0','2','5'],'','W5 p10');
  q('t6','new','c','The CPU tries these in order for a data hazard:',
    'Forwarding, then out-of-order scheduling, then stall',['Stall, forwarding, OoO','OoO, stall, forwarding','Predict, flush, stall'],'','W5 p11');
  q('t6','new','c','Which of these is a structural hazard?',
    'Two imulq instructions needing the single multiplier',['A mispredicted je','A RAW dependency','An unaligned stack'],'','W5 p20');
  q('t6','new','c','Pipelining mainly improves:',
    'Throughput, not individual instruction latency',['Latency, not throughput','Clock-cycle time only','Code size'],'','W5 p7');
  q('t6','new','a','100 branches, 95% predicted correctly, misprediction penalty 10 cycles. Cycles lost?',
    '50',['100','300','10'],'5 × 10 = 50 (vs stalling 100 × 3 = 300).','W5 p15');
  q('t6','new','c','Which are the three kinds of pipeline hazard?',
    'Data, control, structural',['Data, branch, cache','Control, speed, memory','Stall, flush, forward'],'','W5 p8');
  q('t6','new','c','Why are WAR/WAW not a problem in a simple in-order FDEMW pipeline?',
    'Instructions reach W in the order they entered the pipeline',['They are impossible in x86','Forwarding fixes them','The ALU orders them'],'','W5 p12');
  q('t6','new','c','Which hardware does the Decode stage use?',
    'Registers',['ALU','Data memory','Instruction memory'],'','W5 p4');
  q('t6','new','c','Which stage accesses the D-cache?',
    'M',['F','E','W'],'','W5 p4');

  /* ============ T7: Superscalar ============ */
  q('t7','past','c','Why can <code>addq %rbx,%rax</code> and <code>subq %rax,%rcx</code> not normally be issued together by a superscalar CPU?',
    'The second has a RAW dependency on the result of the first',['The first creates a WAR dependency on the second','Superscalar CPUs cannot issue arithmetic together','Both need branch prediction','Both need the same memory port'],'','W5s p9');
  q('t7','past','c','I1: RDX = RAX; I2: RAX = RCX + RAX. If I2 executes before I1, why is it a WAR hazard?',
    'I1 needs the old RAX but I2 writes a new value first',['Both write RAX at once','I1 needs the new value from I2','I2 reads RDX before I1 writes it','They need the same functional unit'],'','W5s p10');
  q('t7','past','c','What is the main purpose of register renaming in an out-of-order superscalar CPU?',
    'To remove false dependencies (WAR/WAW) by mapping architectural to physical registers',['To eliminate true RAW dependencies','To predict branches','To force in-order execution','To add architectural registers'],'','W5s p11');
  q('t7','past','c','A superscalar CPU has several arithmetic units but one multiplier. What can happen with many multiplies?',
    'A structural hazard involving the multiplier',['A control hazard in Fetch','A WAR hazard in every case','An unavoidable flush','A coherence failure'],'','W5 p20');
  q('t7','past','c','Which best distinguishes a simple pipelined processor from a superscalar one?',
    'A superscalar can retire more than one instruction per cycle; a simple pipeline retires one',['A superscalar has no pipeline','A simple pipeline has higher IPC','A simple pipeline needs multiple cores'],'','W5s p5');
  q('t7','past','c','Why can branch mispredictions be especially harmful to superscalar CPUs?',
    'Multiple issue slots may be wasted when wrong-path work is flushed',['They reduce register capacity','They disable ALUs','They shrink memory'],'','W5s p12');
  q('t7','past','c','Why is instruction-level parallelism important to a superscalar CPU?',
    'It provides independent instructions that can execute concurrently',['It reduces register count','It guarantees perfect prediction','It removes caches'],'','W5s p9');
  q('t7','past','c','What is the defining characteristic of a superscalar processor?',
    'It can issue/retire multiple instructions per cycle',['It requires a single ALU','It eliminates pipelining','It disables out-of-order execution'],'','W5s p3');
  q('t7','past','c','Which feature most directly lets a superscalar CPU execute several arithmetic instructions at once?',
    'Multiple execution units',['A slower clock','A deeper cache line','A single pipeline stage'],'','W5s p6');
  q('t7','past','c','A superscalar CPU may still retire fewer instructions than its width because of:',
    'Pipeline hazards and dependencies',['Large RAM','Register size alone','Instruction encoding'],'','W5s p5');
  q('t7','past','c','Why does a superscalar processor benefit from forwarding?',
    'It reduces stalls caused by certain RAW dependencies',['It doubles cache capacity','It removes all control hazards','It increases memory size'],'','W5 p10');
  q('t7','past','c','What is the main benefit of multiple load/store units?',
    'More memory operations can be processed concurrently',['Branches disappear','Latency becomes zero','Caches are unnecessary'],'','W5s p5');
  q('t7','past','c','What does a four-wide superscalar processor mean?',
    'It can potentially issue or retire four instructions per cycle',['It has four pipeline stages','It has four registers','It needs four cores'],'','W5s p5');
  q('t7','past','a','A processor that retires up to four instructions per cycle has maximum IPC:',
    '4',['0.25','1','2','8'],'','W5s p5');
  q('t7','new','c','In an out-of-order superscalar CPU WITHOUT register renaming, which hazards are possible?',
    'RAW, WAR and WAW',['RAW only','None','WAR only'],'','W5s p16');
  q('t7','new','c','With register renaming, which hazard remains?',
    'RAW (true dependency)',['WAR','WAW','None'],'','W5s p11,16');
  q('t7','new','c','Where does a superscalar CPU keep instructions that are waiting for operands?',
    'Reservation stations',['Reorder buffer','Fetch queue','L1 cache'],'','W5s p4');
  q('t7','new','c','What does the reorder buffer guarantee?',
    'Instructions commit in program order',['Instructions execute in program order','No branches','No cache misses'],'','W5s p4');
  q('t7','new','c','Increasing loop-unroll chains from 4 to 8 gave IPC ≈ 2 in both cases. Interpretation?',
    'No further ILP gain — hardware limit reached',['A bug','IPC fell','Branches increased'],'','W5s p15');
  q('t7','new','c','Which architecture has IPC ≤ 1?',
    'Scalar pipelined',['2-issue superscalar','4-issue superscalar','8-issue superscalar'],'','W5s p3');
  q('t7','new','c','Which step selects instructions for execution regardless of program order?',
    'Select ready instructions (from reservation stations)',['Decode','Commit','Fetch'],'','W5s p4');
  q('t7','new','c','Physical registers are denoted P0, P1 … and are:',
    'Not visible to the programmer',['Part of the ISA','The same as xmm','Memory-mapped'],'','W5s p11');

  /* ============ T8: Cache ============ */
  q('t8','past','a','Address 700, line size 64 B. Offset?',
    '60',['63','15','64','0'],'block 10 (640), offset 700 − 640 = 60.','W6 p7');
  q('t8','past','a','Address 129, line size 64 B. Offset?',
    '1',['2','3','5','4'],'block 2 (128) → offset 1.','W6 p7');
  q('t8','past','c','What is the usual relationship between block size and cache-line size?',
    'They are equal',['Block is twice the line','Block is smaller','Block is larger','Unrelated'],'','W6 p6');
  q('t8','past','c','Why does a large working set tend to increase cache misses?',
    'More data competes for limited cache capacity',['Addresses shrink','Offsets disappear','Tags grow'],'','W6 p12');
  q('t8','past','c','What is the main goal of tiling in matrix multiplication?',
    'Reduce the active working set and improve cache locality',['Reduce matrix dimensions','Increase RAM use','Eliminate multiplication'],'','W6 p24');
  q('t8','past','a','L1 cache 32 kB, line 64 B. How many cache lines?',
    '512',['256','128','1024','64'],'32,768 / 64 = 512.','W6 p5');
  q('t8','past','c','Which block numbers all map to set 2 in a 64-set cache?',
    '2, 66, 130, 258',['64, 128, 192, 256','1, 65, 129, 193','15, 16, 17, 18','0, 15, 30, 45'],'set = block % 64.','W6 p6');
  q('t8','past','c','What type of locality is accessing nearby memory addresses?',
    'Spatial locality',['Temporal locality','Thread locality','Control locality','Pipeline locality'],'','W6 p5');
  q('t8','past','a','Cache line 64 B. What is the largest address in block 1111?',
    '71,167',['71,103','71,104','72,215','72,214'],'(1111+1)×64 − 1 = 71,167. Block starts at 71,104.','W6 p6');
  q('t8','past','c','Which miss arises when the working set exceeds cache capacity?',
    'Capacity miss',['Compulsory miss','Conflict miss','TLB miss','Branch miss'],'','W6 p12');
  q('t8','past','c','What is the primary purpose of cache memory?',
    'Reduce how often the CPU waits for slower memory',['Increase disk capacity','Replace registers','Eliminate RAM','Increase program size'],'','W6 p3');
  q('t8','past','c','Which eviction policy removes the line unused for the longest time?',
    'LRU',['LFU','FIFO','Random','Round robin'],'','W6 p10');
  q('t8','past','c','Which eviction policy removes the oldest line in the set?',
    'FIFO',['LRU','LFU','Random','MRU'],'','W6 p10');
  q('t8','past','c','Which eviction policy removes the least frequently accessed line?',
    'LFU',['LRU','FIFO','Random','Write back'],'','W6 p10');
  q('t8','past','c','What occurs when the required tag is absent from the selected set?',
    'Cache miss',['Cache hit','Forwarding','Branch prediction','Register renaming'],'','W6 p8');
  q('t8','past','c','What occurs when the required tag is found in the selected set?',
    'Cache hit',['Conflict miss','Capacity miss','Pipeline flush','Eviction'],'','W6 p8');
  q('t8','past','c','What is a block?',
    'A fixed-size chunk of main memory transferred to the cache',['A pipeline stage','A set of registers','A branch target','A cache miss'],'','W6 p6');
  q('t8','past','c','How is the tag number computed?',
    'Block number divided by the number of sets',['Address modulo line size','Address divided by cache size','Offset divided by set number','Set divided by block'],'','W6 p7');
  q('t8','past','c','How is the set number computed?',
    'Block number modulo the number of sets',['Tag modulo block','Address modulo cache size','Address divided by sets','Offset modulo tag'],'','W6 p6');
  q('t8','past','a','In a cache with 64 sets, which set holds block 300?',
    '44',['79','63','4','16'],'300 % 64 = 300 − 256 = 44.','W6 p6');
  q('t8','past','c','Which cache miss can occur even when the cache has enough total space?',
    'Conflict miss',['Capacity miss','Compulsory miss','Cold-start miss','Write-back miss'],'','W6 p13');
  q('t8','past','c','Why can excessively small tile sizes hurt performance?',
    'Loop overhead can outweigh the cache benefit',['Associativity drops to zero','Tags are not needed','Lines get larger'],'','W6 p26');
  q('t8','past','c','In AxB with 2D arrays, why is ijk usually less cache friendly than ikj?',
    'It accesses elements of B with large strides',['It uses larger integers','It needs recursion','It does more arithmetic'],'','W6 p20');
  q('t8','past','c','Three perf runs of the same matrix multiply: Run 1 L1 miss 0.4%, IPC 2.4, 8.6 s; Run 2 L1 miss 0.7%, IPC 2.4, 8.9 s; Run 3 L1 miss 5.6%, IPC 0.8, 26.2 s. Which run likely used column-order access on B?',
    'Run 3',['Run 1','Run 2','None'],'Highest miss rate, lowest IPC, longest time.','W6 p20');
  q('t8','past','c','Runs of N×N multiply: Run 1 has 1.09 B L1 misses and 53 B instructions; Run 2 has 2.07 M misses and 110 M instr; Run 3 has 17 M and 842 M; Run 4 has 135 M and 6.6 B. Which run used the LARGEST N?',
    'Run 1',['Run 2','Run 3','Run 4'],'Most instructions and most misses → biggest N.','W6 p23');
  q('t8','past','c','Four runs on an array sorted to varying degrees: IPC 0.6, 0.7, 1.1, 0.8. Which run was most sorted?',
    'The run with IPC 1.1',['The run with IPC 0.6','The run with IPC 0.7','The run with IPC 0.8'],'Sorted ⇒ predictable branches ⇒ higher IPC.','W5 p17');
  q('t8','new','a','Address 5000, line 64 B. Block number?',
    '78',['5000','64','79'],'5000 / 64 = 78 (78×64 = 4992).','W6 p6');
  q('t8','new','a','Address 5000 (64 B lines, 64 sets). Set number?',
    '14',['78','0','15'],'block 78; 78 % 64 = 14.','W6 p6');
  q('t8','new','a','Address 5000 (64 B lines, 64 sets). Tag?',
    '1',['0','78','14'],'78 / 64 = 1.','W6 p7');
  q('t8','new','a','Address 5000. Offset within the block?',
    '8',['14','78','4'],'5000 − 4992 = 8.','W6 p7');
  q('t8','new','a','L1d is 32 kB, 8-way, 64 B lines. How many sets?',
    '64',['512','8','32'],'512 lines / 8 ways.','W6 p5');
  q('t8','new','c','Two blocks with the same set number but different tags:',
    'Compete for the 8 lines of that one set',['Always conflict in every set','Never both fit','Share one line'],'','W6 p9');
  q('t8','new','c','In ijk with N=1024 ints, why does b[k][j] cause conflict misses?',
    'Row stride 4096 B = 64 blocks, so all map to the same set',['Rows are too short','Tags are identical','Offsets overlap'],'','W6 p21');
  q('t8','new','a','With a, b ints and c long long of size N×N, working set = 16N² bytes. Largest N that fits 32 kB (rough)?',
    '45',['181','1024','16'],'16N² < 32,768 → N² < 2048 → N < 45.','W6 p22');
  q('t8','new','c','Block 15 covers which addresses (64 B lines)?',
    '960 – 1,023',['0 – 63','900 – 963','1,000 – 1,063'],'','W6 p6');
  q('t8','new','c','A first-ever access to a block causes which miss?',
    'Compulsory',['Capacity','Conflict','Tag'],'','W6 p12');
  q('t8','new','c','Which command shows cache sizes on Linux?',
    'lscpu --cache',['perf cache','gcc -cache','top -c'],'','W6 p5');
  q('t8','new','c','Tile size 8 was best in the slides because:',
    'Better locality and fewer set conflicts; smaller tiles add loop overhead',['It uses SIMD','Branch misses vanish','RAM is faster'],'','W6 p26');
  q('t8','new','c','Basic matrix multiplication of two n×n matrices has complexity:',
    'O(n³)',['O(n²)','O(n log n)','O(2ⁿ)'],'','W6 p16');
  q('t8','new','c','From N=512 to N=1024, IPC fell 1.9 → 0.7 and L1 misses rose sharply. Cause?',
    'CPU waits for memory due to poor spatial locality',['Branch misprediction','More threads','Fewer instructions'],'','W6 p23');
})();
