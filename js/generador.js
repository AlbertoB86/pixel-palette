(function() {
    window.addEventListener('load', iniciar);

    function iniciar(){
        const boton = document.getElementById('generate-btn');
        const colores = document.getElementById('palette');   
        const ejemplos = document.getElementById('ejemplos');
        const toggle = document.getElementById('selector');      
        const dragInfo = document.getElementById('drag-info');
        const bombilla = document.getElementById('bombilla');        
        const copyInfo = document.getElementById('copy-info');
        const hexInput = document.getElementById('color-hex');
        const rInput = document.getElementById('r');
        const gInput = document.getElementById('g');
        const bInput = document.getElementById('b');
        const colorPicker = new iro.ColorPicker("#colorWheel",{
            width: 180,
            color: "#fff7fa",
            borderWidth: 2,
            borderColor: "#41255a"
        });      

        let encendida = false;
        let animacionBombillaActiva = false;

        sincronizarColorBase(colorPicker, hexInput, rInput, gInput, bInput);        
        
        toggle.addEventListener('change', actualizarFormato);  
        boton.addEventListener('click', () =>{                
            const hex = hexInput.value.trim();
            const r = rInput.value;
            const g = gInput.value;
            const b = bInput.value;
            let base;

            if(chroma.valid(hex)){
                base = chroma(hex);
                colorPicker.color.hexString = base.hex(); // sincroniza la rueda
            }else if(r !== '' && g !== '' && b !== '' && !isNaN(r) && !isNaN(g) && !isNaN(b) && +r >= 0 && +r <= 255 && +g >= 0 && +g <= 255 && +b >= 0 && +b <= 255){
                base = chroma.rgb(+r, +g, +b);
                colorPicker.color.rgb = { r: +r, g: +g, b: +b }; // sincroniza la rueda
                hexInput.value = base.hex().toUpperCase(); // sincroniza el HEX
            } else {
                base = chroma.random();
                colorPicker.color = base; // sincroniza la rueda
                hexInput.value = base.hex().toUpperCase(); // sincroniza el HEX
                rInput.value = base.rgb()[0];
                gInput.value = base.rgb()[1];
                bInput.value = base.rgb()[2];
            }

            const opcion = document.getElementById('harmony').value;
            let armonia = selectArmonia(base, opcion);      
            
            //Constante para comprobar el estado del HEX o RGB
            const hexRgb = toggle.checked;

            //Generamos la paleta con 5 colores partiendo del color base, y segun la armonia que decidamos
            const escala = chroma.scale([base, armonia]).mode('lab').colors(5);
            
            colores.innerHTML = '';
            ejemplos.innerHTML = '';      

            /* Bucle para generar los 5 colores de la paleta, creamos la caja
                Añadimos el color al fondo de la caja y ponemos el texto en RGB o HEX segun */ 
            for(let i = 0; i < escala.length; i++){
                const col = chroma(escala[i]);
                let color = document.createElement('div');

                color.className = 'caja';
                color.style.backgroundColor = escala[i];

                const valorColor = hexRgb ? col.css() : col.hex().toUpperCase();
                color.innerHTML = valorColor;
                color.dataset.colorValue = valorColor;

                // Contraste para texto legible
                const contraste = chroma.contrast(col, 'white');
                color.style.color = contraste > 4.5 ? 'white' : 'black';

                //Le añadimos a color el atributo para que sea arrastable
                color.setAttribute('draggable', true);
                //e.dataTransfer sirve para guardar el valor y recuperarlo al soltar
                color.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', escala[i]); 
                });

                color.addEventListener('click', () => copiar(color));

                colores.appendChild(color);

                document.querySelector('.roles').classList.remove('hidden');                
            }  

            const zonas = document.querySelectorAll('.drop-zone');
            crearDrops(zonas);   

            const objColores = asignarColores(escala);
            generarEjemplos(objColores);

            mostrarInfo();            
        });


        function sincronizarColorBase(rueda, hexInput, rInput, gInput, bInput){
            // Mediante la rueda, actualiza HEX y RGB
            rueda.on('color:change', function(color){
            const rgb = color.rgb;
            hexInput.value = color.hexString.toUpperCase();
            rInput.value = rgb.r;
            gInput.value = rgb.g;
            bInput.value = rgb.b;
        });

        // Mediante un valor HEX, actualiza la rueda y RGB
        hexInput.addEventListener('change', function (){
            const val = hexInput.value.trim();
            if (chroma.valid(val)){
                const newColor = chroma(val);
                rueda.color.hexString = newColor.hex();
                const rgb = newColor.rgb();
                rInput.value = rgb.r;
                gInput.value = rgb.g;
                bInput.value = rgb.b;
            }else{
                alert("Introduce un color HEX válido");
            }
        });

        // Mediante valores R, G o B, actualiza HEX y rueda 
        [rInput, gInput, bInput].forEach(input =>{
            input.addEventListener('input', () =>{
                const r = +rInput.value.trim();
                const g = +gInput.value.trim();
                const b = +bInput.value.trim();

                if (r !== '' && g !== '' && b !== ''){
                    const rVal = +r, gVal = +g, bVal = +b;
                    if (!isNaN(rVal) && !isNaN(gVal) && !isNaN(bVal)){
                        if(rVal >= 0 && rVal <= 255 && gVal >= 0 && gVal <= 255 && bVal >= 0 && bVal <= 255){
                            const color = chroma.rgb(rVal, gVal, bVal);
                            rueda.color.rgb = { r: rVal, g: gVal, b: bVal };
                            hexInput.value = color.hex().toUpperCase();
                        }else{
                            let errores = [];
                            if (rVal < 0 || rVal > 255) errores.push("Rojo (R)");
                            if (gVal < 0 || gVal > 255) errores.push("Verde (G)");
                            if (bVal < 0 || bVal > 255) errores.push("Azul (B)");
                            alert(`Valor fuera de rango en: ${errores.join(', ')}. Deben estar entre 0 y 255.`);
                        }
                    } else {
                        alert("Los valores deben ser números enteros.");
                    }
                }
            });
        });
        }

        // Funcion para seleccionar una Armonia, 
        function selectArmonia(base, opcion){
            let armonia = '';

            switch(opcion){
                case 'random':
                    armonia = chroma.random();
                    break;
                case 'analogous':
                    armonia = base.set('hsl.h', (base.get('hsl.h') + 30) % 360);
                    break;
                case 'complementary':
                    armonia = base.set('hsl.h', (base.get('hsl.h') + 180) % 360);
                    break;
                case 'monochromatic':
                    armonia = base.set('hsl.l', (base.get('hsl.l') > 0.5 ? base.get('hsl.l') - 0.3 : base.get('hsl.l') + 0.3));
                    break;
                case 'triadic':
                    armonia = base.set('hsl.h', (base.get('hsl.h') + 120) % 360); 
                    break;
                default:
                    armonia = chroma.random();
                    break;
            }
            return armonia;
        }
        
        // Funcion para cambiar el texto entre HEX o RGB
        function actualizarFormato(){
            const cajas = document.querySelectorAll('.caja');
            const hexRgb = toggle.checked;

            cajas.forEach(caja =>{
                const bg = caja.style.backgroundColor;
                const color = chroma(bg);
                const valor = hexRgb ? color.css() : color.hex().toUpperCase();
                caja.innerText = valor;
                caja.dataset.colorValue = valor;
                
            });
        }

        // Funcion para asiganr los valore spor defecto en los ejemplos
        function asignarColores(escala){
            //Ordenamos los colores de más oscuro aa más claro
            const ordenados = [...escala].sort((a, b) => chroma(a).luminance() - chroma(b).luminance());            
            return{
                fondo: ordenados[4],
                titulo: ordenados[1],
                texto: ordenados[2],
                botonFondo: ordenados[3],
                botonTexto: ordenados[0]
            }
        }

        // Funcion para que el usuario pueda cambiar los colores en los ejemplos
        function aplicarColor(role, color){
            const titulo = document.getElementById('titulo-preview');
            const texto = document.getElementById('texto-preview');
            const boton = document.getElementById('boton-ejemplo');

            switch(role){
                case 'fondo':
                    ejemplos.style.backgroundColor = color;
                    break;
                case 'titulo':
                    titulo.style.color = color;
                    break;
                case 'texto':
                    texto.style.color = color;
                    break;
                case 'botonFondo':
                    boton.style.background = color;
                    break;
                case 'botonTexto':
                    boton.style.color = color;
                    break;
            }
        }

        function copiar(color){       
            navigator.clipboard.writeText(color.dataset.colorValue)
            .then(() => {
                const original = color.dataset.colorValue;
                color.textContent = 'Copiado!';
                setTimeout(() => {
                    color.innerText = original;
                }, 300);
            })
            .catch(err => {
                console.error('Error al copiar:', err);
            });          
        }

        function generarEjemplos(objColores){
            ejemplos.style.backgroundColor = objColores.fondo;

            let titulo = document.createElement('h1');
            titulo.id = 'titulo-preview';
            titulo.style.color = objColores.titulo;
            titulo.innerText = 'Titulo de Ejemplo';

            let texto = document.createElement('p');
            texto.id = 'texto-preview';
            texto.style.color = objColores.texto;
            texto.innerText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia tempora excepturi, eos minima exercitationem, facere eaque sit natus sint alias reiciendis! Nulla beatae omnis odit reiciendis repudiandae. Ipsam, asperiores ea.';

            let btnPreview = document.createElement('button');
            btnPreview.id = 'boton-ejemplo';
            btnPreview.style.color = objColores.botonTexto;
            btnPreview.style.background = objColores.botonFondo;
            btnPreview.innerText = 'Pulsar';

            ejemplos.appendChild(titulo);
            ejemplos.appendChild(texto);
            ejemplos.appendChild(btnPreview);
        }

        function mostrarInfo(){
            //Cambia la bombilla a "on" / "off" cada seg
            dragInfo.classList.remove('hidden');
            if (!animacionBombillaActiva){
                animacionBombillaActiva = true;
                intervaloBombilla = setInterval(() => {
                    encendida = !encendida;
                    bombilla.src = encendida 
                        ? './assets/icons/lightbulb-pixel-on.png' 
                        : './assets/icons/lightbulb-pixel-off.png';
                },1000);
            }
            copyInfo.classList.remove('hidden');
        }

        function crearDrops(zonas){
            zonas.forEach(zona =>{
                zona.addEventListener('dragover', e => {
                    e.preventDefault(); // Permite soltar
                    zona.style.borderColor = '#fff'; // Feedback visual opcional
                });

                zona.addEventListener('dragleave', () => {
                    zona.style.borderColor = '#ccc';
                });

                zona.addEventListener('drop', e =>{
                    e.preventDefault();
                    zona.style.borderColor = '#ccc';
                    const color = e.dataTransfer.getData('text/plain');
                    aplicarColor(zona.dataset.role, color);
                });
            });
        }
    }
})();