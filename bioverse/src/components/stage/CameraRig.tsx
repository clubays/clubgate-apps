/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useStageStore } from '@/store/useStageStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface CameraRigProps {
  initialCameraPos?: [number, number, number];
  initialTarget?: [number, number, number];
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 1.5, 6.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

export function CameraRig({
  initialCameraPos = [0, 1.5, 6.5],
  initialTarget = [0, 0, 0],
}: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const { cameraPosition, cameraTarget, resetCameraTrigger } = useStageStore();
  const { reduceMotion } = useSettingsStore();

  const targetCamPos = useRef(new THREE.Vector3(...initialCameraPos));
  const targetLookAt = useRef(new THREE.Vector3(...initialTarget));
  const isTransitioning = useRef(false);

  // Update targets when stage store updates
  useEffect(() => {
    if (cameraPosition) {
      targetCamPos.current.set(...cameraPosition);
      isTransitioning.current = true;
    }
  }, [cameraPosition]);

  useEffect(() => {
    if (cameraTarget) {
      targetLookAt.current.set(...cameraTarget);
      isTransitioning.current = true;
    }
  }, [cameraTarget]);

  // Reset camera trigger
  useEffect(() => {
    if (resetCameraTrigger > 0) {
      targetCamPos.current.copy(DEFAULT_CAMERA_POS);
      targetLookAt.current.copy(DEFAULT_TARGET);
      isTransitioning.current = true;
    }
  }, [resetCameraTrigger]);

  // Keyboard navigation: WASD, Q/E, +/-, R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        return;
      }

      const ctrl = controlsRef.current;
      if (!ctrl) return;

      const panSpeed = 0.3;
      const rotateSpeed = 0.15;

      switch (e.key.toLowerCase()) {
        case 'w':
          camera.position.y += panSpeed;
          ctrl.target.y += panSpeed;
          break;
        case 's':
          camera.position.y -= panSpeed;
          ctrl.target.y -= panSpeed;
          break;
        case 'a':
          camera.position.x -= panSpeed;
          ctrl.target.x -= panSpeed;
          break;
        case 'd':
          camera.position.x += panSpeed;
          ctrl.target.x += panSpeed;
          break;
        case 'q':
          ctrl.autoRotate = false;
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateSpeed);
          break;
        case 'e':
          ctrl.autoRotate = false;
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotateSpeed);
          break;
        case '+':
        case '=':
          camera.position.multiplyScalar(0.92);
          break;
        case '-':
        case '_':
          camera.position.multiplyScalar(1.08);
          break;
        case 'r':
          targetCamPos.current.copy(DEFAULT_CAMERA_POS);
          targetLookAt.current.copy(DEFAULT_TARGET);
          isTransitioning.current = true;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);

  // Smooth frame interpolation
  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

    const dampSpeed = reduceMotion ? 12 : 5;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, dampSpeed, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, dampSpeed, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, dampSpeed, delta);

    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.damp(
        controlsRef.current.target.x,
        targetLookAt.current.x,
        dampSpeed,
        delta
      );
      controlsRef.current.target.y = THREE.MathUtils.damp(
        controlsRef.current.target.y,
        targetLookAt.current.y,
        dampSpeed,
        delta
      );
      controlsRef.current.target.z = THREE.MathUtils.damp(
        controlsRef.current.target.z,
        targetLookAt.current.z,
        dampSpeed,
        delta
      );
      controlsRef.current.update();
    }

    // Settle when close
    if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
      isTransitioning.current = false;
    }
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableDamping={!reduceMotion}
      dampingFactor={0.06}
      minDistance={1.8}
      maxDistance={14}
      maxPolarAngle={Math.PI * 0.88}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}
