#!/usr/bin/env python3
"""
Lee un archivo Excel de MMPI-2 (formato VS BB terceros) y extrae los puntajes.
"""
import pandas as pd
import json
import sys

def read_mmpi2_excel(file_path):
    result = {
        'escalasValidez': {},
        'escalasClinicas': {},
        'subescalas': {},
        'sexo': 'masculino',
        'cargado': True
    }
    
    try:
        # Leer la hoja de Puntajes T
        df = pd.read_excel(file_path, sheet_name='Puntajes T', header=None)
        
        # === ESCALAS DE VALIDEZ ===
        # Fila 0: nombres (L, F, K)
        # Fila 1: valores brutos (L=col0, F=col1, K=col2)
        # Fila 2: valores T
        
        # L - columna 0
        result['escalasValidez']['lBruto'] = int(df.iloc[1, 0]) if pd.notna(df.iloc[1, 0]) else 0
        result['escalasValidez']['lT'] = int(df.iloc[2, 0]) if pd.notna(df.iloc[2, 0]) else 50
        
        # F - columna 1  
        result['escalasValidez']['fBruto'] = int(df.iloc[1, 1]) if pd.notna(df.iloc[1, 1]) else 0
        result['escalasValidez']['fT'] = int(df.iloc[2, 1]) if pd.notna(df.iloc[2, 1]) else 50
        
        # K - columna 2
        result['escalasValidez']['kBruto'] = int(df.iloc[1, 2]) if pd.notna(df.iloc[1, 2]) else 0
        result['escalasValidez']['kT'] = int(df.iloc[2, 2]) if pd.notna(df.iloc[2, 2]) else 50
        
        # F-K (columna 6, fila 1)
        result['escalasValidez']['f_K'] = int(df.iloc[1, 6]) if pd.notna(df.iloc[1, 6]) else 0
        
        # Valores por defecto para campos que no están en el Excel
        result['escalasValidez']['omisiones'] = 0
        result['escalasValidez']['fbT'] = 50
        result['escalasValidez']['fpBruto'] = 3
        
        # === ESCALAS CLÍNICAS BÁSICAS ===
        # Fila 4: nombres (Hs, D, Hy, Pd, MfM, MfF, Pa, Pt, Sc, Ma, Si)
        # Fila 5: valores brutos
        # Fila 6: valores T
        escalas_mapping = {
            0: 'Hs', 1: 'D', 2: 'Hy', 3: 'Pd', 4: 'Mf', 5: 'MfF', 
            6: 'Pa', 7: 'Pt', 8: 'Sc', 9: 'Ma', 10: 'Si'
        }
        
        for col, nombre in escalas_mapping.items():
            bruto = df.iloc[5, col] if pd.notna(df.iloc[5, col]) else 0
            t = df.iloc[6, col] if pd.notna(df.iloc[6, col]) else 50
            
            # Para Mf, usar columna 4 (MfM) por defecto
            if nombre == 'MfF':
                continue  # Saltar, solo usamos Mf
                
            result['escalasClinicas'][nombre] = {
                'bruto': int(bruto),
                'T': int(t)
            }
        
        # === VRIN Y TRIN ===
        try:
            df_brutos = pd.read_excel(file_path, sheet_name='Puntajes Brutos', header=None)
            
            # Buscar VRIN en la última columna
            for col in range(df_brutos.shape[1] - 1, -1, -1):
                val = str(df_brutos.iloc[0, col]).lower() if pd.notna(df_brutos.iloc[0, col]) else ''
                if 'vrin' in val:
                    # VRIN T se calcula de forma diferente - usar valor por defecto o calculado
                    result['escalasValidez']['vrint'] = 50  # Valor por defecto
                    break
            
            # Buscar TRIN
            for col in range(df_brutos.shape[1] - 1, -1, -1):
                val = str(df_brutos.iloc[5, col]).lower() if pd.notna(df_brutos.iloc[5, col]) else ''
                if 'trin' in val:
                    result['escalasValidez']['trint'] = 50  # Valor por defecto
                    break
            
        except Exception as e:
            pass
        
        # Valores por defecto si no se encontraron
        if 'vrint' not in result['escalasValidez']:
            result['escalasValidez']['vrint'] = 50
        if 'trint' not in result['escalasValidez']:
            result['escalasValidez']['trint'] = 50
        
        # === SUBESCALAS HARRIS-LINGOES ===
        # Fila 9: D1-D5, Pa1-Pa3, Si1-Si3 (nombres)
        # Fila 10: brutos
        # Fila 11: T
        subescalas_f9 = ['D1', 'D2', 'D3', 'D4', 'D5', 'Pa1', 'Pa2', 'Pa3', 'Si1', 'Si2', 'Si3']
        for i, nombre in enumerate(subescalas_f9):
            bruto = df.iloc[10, i] if pd.notna(df.iloc[10, i]) else 0
            t = df.iloc[11, i] if pd.notna(df.iloc[11, i]) else 50
            result['subescalas'][nombre] = {'bruto': int(bruto), 'T': int(t)}
        
        # Fila 12: Hy1-Hy5, Ma1-Ma4 (nombres)
        # Fila 13: brutos
        # Fila 14: T
        subescalas_f12 = ['Hy1', 'Hy2', 'Hy3', 'Hy4', 'Hy5', 'Ma1', 'Ma2', 'Ma3', 'Ma4']
        for i, nombre in enumerate(subescalas_f12):
            bruto = df.iloc[13, i] if pd.notna(df.iloc[13, i]) else 0
            t = df.iloc[14, i] if pd.notna(df.iloc[14, i]) else 50
            result['subescalas'][nombre] = {'bruto': int(bruto), 'T': int(t)}
        
        # Fila 15: Pd1-Pd5, Sc1-Sc6 (nombres)
        # Fila 16: brutos
        # Fila 17: T
        subescalas_f15 = ['Pd1', 'Pd2', 'Pd3', 'Pd4', 'Pd5', 'Sc1', 'Sc2', 'Sc3', 'Sc4', 'Sc5', 'Sc6']
        for i, nombre in enumerate(subescalas_f15):
            bruto = df.iloc[16, i] if pd.notna(df.iloc[16, i]) else 0
            t = df.iloc[17, i] if pd.notna(df.iloc[17, i]) else 50
            result['subescalas'][nombre] = {'bruto': int(bruto), 'T': int(t)}
        
        return result
        
    except Exception as e:
        import traceback
        return {'error': str(e), 'traceback': traceback.format_exc()}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = read_mmpi2_excel(file_path)
    print(json.dumps(result))
