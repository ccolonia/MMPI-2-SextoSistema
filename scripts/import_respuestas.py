#!/usr/bin/env python3
"""
Importa respuestas de MMPI-2 desde un archivo Excel o CSV.

Formato aceptado:
- Columna Pregunta: 1-567
- Columna Verdadero: 1 o 0
- Columna Falso: 1 o 0
- Columna No_Contesta: 1 o 0

Solo debe haber un "1" por fila (una respuesta por pregunta).
"""
import pandas as pd
import json
import sys

def import_respuestas(file_path):
    try:
        # Intentar leer como Excel
        if file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path, header=0)
        else:
            # CSV
            df = pd.read_csv(file_path, header=0)
        
        # Normalizar nombres de columnas
        df.columns = [str(col).strip().lower().replace(' ', '_').replace('-', '_') for col in df.columns]
        
        # Buscar columnas
        pregunta_col = None
        verdadero_col = None
        falso_col = None
        no_contesta_col = None
        
        for col in df.columns:
            col_lower = col.lower()
            if 'pregunta' in col_lower or 'numero' in col_lower or 'num' in col_lower or col_lower == 'n':
                pregunta_col = col
            elif 'verdadero' in col_lower or col_lower == 'v' or col_lower == 'true':
                verdadero_col = col
            elif 'falso' in col_lower or col_lower == 'f' or col_lower == 'false':
                falso_col = col
            elif 'no_contesta' in col_lower or 'nocontesta' in col_lower or 'nc' in col_lower:
                no_contesta_col = col
        
        respuestas = []
        total_preguntas = 567
        formato_nuevo_detectado = False
        
        # Si encontramos las columnas de formato nuevo
        if verdadero_col and falso_col:
            formato_nuevo_detectado = True
            for idx, row in df.iterrows():
                try:
                    # Obtener número de pregunta
                    if pregunta_col:
                        num = int(row[pregunta_col])
                    else:
                        num = idx + 1
                    
                    if num < 1 or num > total_preguntas:
                        continue
                    
                    # Obtener valores
                    verdadero_val = 0
                    falso_val = 0
                    no_contesta_val = 0
                    
                    if verdadero_col and pd.notna(row.get(verdadero_col)):
                        try:
                            verdadero_val = int(float(row[verdadero_col]))
                        except:
                            pass
                    
                    if falso_col and pd.notna(row.get(falso_col)):
                        try:
                            falso_val = int(float(row[falso_col]))
                        except:
                            pass
                    
                    if no_contesta_col and pd.notna(row.get(no_contesta_col)):
                        try:
                            no_contesta_val = int(float(row[no_contesta_col]))
                        except:
                            pass
                    
                    # Determinar respuesta
                    # Solo contar si hay exactamente un "1" en las columnas de respuesta
                    total_ones = verdadero_val + falso_val + no_contesta_val
                    
                    if total_ones == 0:
                        # Sin respuesta - omitir
                        continue
                    elif no_contesta_val == 1:
                        valor = None  # No contesta
                    elif verdadero_val == 1:
                        valor = True
                    elif falso_val == 1:
                        valor = False
                    else:
                        # Múltiples respuestas - omitir o tratar como no contesta
                        continue
                    
                    respuestas.append({'numero': num, 'valor': valor})
                    
                except Exception as e:
                    continue
        
        # Si no encontramos el formato nuevo, intentar formato antiguo
        if len(respuestas) == 0 and not formato_nuevo_detectado:
            # Formato antiguo: Numero | Respuesta
            for idx, row in df.iterrows():
                try:
                    if pregunta_col:
                        num = int(row[pregunta_col])
                    else:
                        num = idx + 1
                    
                    if num < 1 or num > total_preguntas:
                        continue
                    
                    # Buscar valor de respuesta
                    valor_raw = None
                    for col in df.columns:
                        if col != pregunta_col:
                            val = row[col]
                            if pd.notna(val):
                                valor_raw = val
                                break
                    
                    if valor_raw is None:
                        continue
                    
                    # Parsear respuesta
                    valor_str = str(valor_raw).strip().upper()
                    
                    if valor_str in ['V', 'VERDADERO', 'TRUE', '1', 'S', 'SI', 'SÍ', 'T']:
                        valor = True
                    elif valor_str in ['F', 'FALSO', 'FALSE', '0', 'N', 'NO']:
                        valor = False
                    elif valor_str in ['NC', 'NO CONTESTA', 'NO RESPONDE', '-', '', 'NULL', 'NONE']:
                        valor = None
                    else:
                        try:
                            num_val = float(valor_str)
                            valor = True if num_val == 1 else (False if num_val == 0 else None)
                        except:
                            valor = None
                    
                    respuestas.append({'numero': num, 'valor': valor})
                    
                except Exception as e:
                    continue
        
        # Validar que se obtuvieron respuestas
        if len(respuestas) == 0:
            return {'error': 'No se encontraron respuestas válidas en el archivo. Verifique el formato.'}
        
        # Ordenar por número de pregunta
        respuestas.sort(key=lambda x: x['numero'])
        
        return {
            'respuestas': respuestas,
            'total': len(respuestas),
            'verdaderas': sum(1 for r in respuestas if r['valor'] == True),
            'falsas': sum(1 for r in respuestas if r['valor'] == False),
            'no_contesta': sum(1 for r in respuestas if r['valor'] is None)
        }
        
    except Exception as e:
        import traceback
        return {'error': str(e), 'traceback': traceback.format_exc()}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = import_respuestas(file_path)
    print(json.dumps(result))
