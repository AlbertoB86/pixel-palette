window.addEventListener('load', iniciar);

function iniciar(){
    const boton = document.getElementById('generate-btn');
    const colores = document.getElementById('palette');   
    const ejemplos = document.getElementById('ejemplos');
    const toggle = document.getElementById('selector');
    toggle.addEventListener('change', actualizarFormato);  


    boton.addEventListener('click', () =>{     
        //Generamos el color base random   
        const base = chroma.random();        
        console.log('Base:',base.hex());

        //Llamada a la funcion selectArmonia 
        const opcion = document.getElementById('harmony').value;
        let armonia = selectArmonia(base, opcion);      
        
        //Constante para comprobar el estado del HEX o RGB
        const hexRgb = toggle.checked;
        console.log(hexRgb);

        //Generamos la paleta con 5 colores partiendo del color base, y segun la armonia que decidamos
        const escala = chroma.scale([base, armonia]).mode('lab').colors(5);

        console.log('Escala:', escala);

        colores.innerHTML = '';
        ejemplos.innerHTML = '';

        /* Bucle para generar los 5 colores de la paleta, creamos la caja
            Añadimos el color al fondo de la caja y ponemos el texto en RGB o HEX segun */ 
        for(let i = 0; i < escala.length; i++){
            const col = chroma(escala[i]);
            let color = document.createElement('div');

            color.className = 'caja';
            color.style.backgroundColor = escala[i];

            color.innerText = hexRgb ? col.css() : col.hex();     
            
            // Contraste para texto legible
            const contraste = chroma.contrast(col, 'white');
            color.style.color = contraste > 4.5 ? 'white' : 'black';

            colores.appendChild(color);
        }  
        
        ejemplos.style.backgroundColor = escala[0];

        let titulo = document.createElement('h1');
        titulo.style.color = escala[1];
        titulo.innerText = 'H1 de Ejemplo';

        let texto = document.createElement('p');
        texto.style.color = escala[2];
        texto.innerText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia tempora excepturi, eos minima exercitationem, facere eaque sit natus sint alias reiciendis! Nulla beatae omnis odit reiciendis repudiandae. Ipsam, asperiores ea.';

        let boton = document.createElement('button');
        boton.style.color = escala[3];
        boton.style.background = escala[4];
        boton.innerText = 'Pulsar';

        ejemplos.appendChild(titulo);
        ejemplos.appendChild(texto);
        ejemplos.appendChild(boton);
    });

    // Funcion para seleccionar una Armonia, 
    function selectArmonia(base, opcion){
        let armonia = '';

        switch(opcion){
            case 'random':
                armonia = chroma.random();
                console.log('Aleatorio:',armonia.hex());
                break;
            case 'analogous':
                armonia = base.set('hsl.h', (base.get('hsl.h') + 30) % 360);
                console.log('Analogo:',armonia.hex());
                break;
            case 'complementary':
                armonia = base.set('hsl.h', (base.get('hsl.h') + 180) % 360);
                console.log('Complementario:',armonia.hex());
                break;
            case 'monochromatic':
                armonia = base.set('hsl.l', (base.get('hsl.l') > 0.5 ? base.get('hsl.l') - 0.3 : base.get('hsl.l') + 0.3));
                console.log('Monocromatica:',armonia.hex());
                break;
            case 'triadic':
                armonia = base.set('hsl.h', (base.get('hsl.h') + 120) % 360); 
                console.log('Triada:',armonia.hex());
                break;
            default:
                armonia = chroma.random();
                break;
        }
        return armonia;
    }

    function actualizarFormato(){
        const cajas = document.querySelectorAll('.caja');
        const hexRgb = toggle.checked;

        cajas.forEach(caja =>{
            const bg = caja.style.backgroundColor;
            const color = chroma(bg);
            caja.innerText = hexRgb ? color.css() : color.hex();
        });
    }
}